import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/api-utils";
import { aiEnabled, aiRateLimiter } from "@/lib/ai";
import { GoogleGenerativeAI, SchemaType, Content } from "@google/generative-ai";
import { fetchUserCounts } from "@/lib/ai/assistant-tools";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!aiEnabled() || !genAI) {
      return NextResponse.json({ error: "AI features are currently unavailable." }, { status: 503 });
    }

    const rateLimitResponse = await aiRateLimiter.check(request, session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { messages } = body as { messages: { role: string; content: string }[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages format." }, { status: 400 });
    }

    const systemPrompt = `You are SyncMate, the official platform assistant for SkillSync.
You are chatting with a ${session.user.role} named ${session.user.name?.split(" ")[0] || "User"}.

Platform Context:
- SkillSync is a freelance platform connecting clients with skilled freelancers.
- Features: Smart matching (semantic search), AI writing assistance for profiles and proposals, Hiring Copilot for analyzing proposals, and Review Intelligence for summarizing feedback.
- Available Pages: /search (find gigs/freelancers), /projects (client dashboard), /freelancers (browse profiles), /contracts (contract workspace), /messages (inbox), /settings (profile).

Capabilities & Boundaries:
- You are a helpful assistant providing guidance and information about the platform.
- DO NOT provide legal, financial, or tax advice.
- DO NOT make autonomous decisions or take actions on the user's behalf.
- If the user reports abuse, harassment, or safety concerns, you MUST hard redirect them to contact support via the Help Center or support@skillsync.com; do NOT attempt to mediate or resolve it yourself.
- You have a tool 'getDashboardCounts' to check the user's active contracts, pending proposals, and unread messages. Use it when they ask "what needs my attention?" or similar questions about their dashboard.
- If the user asks about another user's private data (like someone else's contracts or proposals), you must firmly refuse.`;

    const tools = [
      {
        functionDeclarations: [
          {
            name: "getDashboardCounts",
            description: "Fetch the user's active contracts, pending proposals, and unread messages.",
            parameters: { type: SchemaType.OBJECT, properties: {} },
          },
        ],
      },
    ];

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
      tools,
    });

    // Format history for Gemini
    const formattedHistory: Content[] = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return NextResponse.json({ error: "No messages" }, { status: 400 });
    const latestMessageContent = lastMessage.content;

    const chat = model.startChat({ history: formattedHistory });

    let result = await chat.sendMessageStream(latestMessageContent);

    // Consume first chunk to check for function calls
    let firstChunk: any = null;
    if (!result.stream) throw new Error("No stream returned");
    let streamIterator = result.stream[Symbol.asyncIterator]();
    let iteratorResult = await streamIterator.next();

    if (!iteratorResult.done) {
      firstChunk = iteratorResult.value;
      if (firstChunk.functionCall()) {
        const call = firstChunk.functionCall();
        if (call.name === "getDashboardCounts") {
          const counts = await fetchUserCounts(session.user.id, session.user.role || "client");
          const functionResponse = [
            {
              functionResponse: { name: "getDashboardCounts", response: counts },
            },
          ];
          result = await chat.sendMessageStream(functionResponse);
          if (!result.stream) throw new Error("No stream returned on tool response");
          streamIterator = result.stream[Symbol.asyncIterator]();
          iteratorResult = await streamIterator.next();
          if (!iteratorResult.done) {
            firstChunk = iteratorResult.value;
          } else {
            firstChunk = null;
          }
        }
      }
    }

    const readable = new ReadableStream({
      async start(controller) {
        try {
          if (firstChunk && firstChunk.text) {
            controller.enqueue(new TextEncoder().encode(firstChunk.text()));
          }
          while (true) {
            iteratorResult = await streamIterator.next();
            if (iteratorResult.done) break;
            const chunk = iteratorResult.value;
            if (chunk.text) {
              controller.enqueue(new TextEncoder().encode(chunk.text()));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error("[POST /api/ai/assistant]", error);
    return NextResponse.json({ error: "Failed to initialize assistant." }, { status: 500 });
  }
}
