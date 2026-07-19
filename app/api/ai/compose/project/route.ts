import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/api-utils";
import { generateText, aiEnabled, AIUnavailableError } from "@/lib/ai";
import { SchemaType } from "@google/generative-ai";
import { aiProjectSchema } from "@/types/schemas";
import { rateLimits } from "@/lib/rate-limit";

const projectComposerSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING, description: "A concise, professional project title (max 80 chars)." },
    description: { type: SchemaType.STRING, description: "A structured, detailed project description including goals and deliverables." },
    skills: { 
      type: SchemaType.ARRAY, 
      items: { type: SchemaType.STRING },
      description: "List of 1 to 5 relevant technical skills."
    },
    experienceLevel: { 
      type: SchemaType.STRING, 
      description: "One of: 'beginner', 'intermediate', or 'expert'." 
    }
  },
  required: ["title", "description", "skills", "experienceLevel"]
};

export async function POST(request: Request) {
  try {
    const rateLimitError = rateLimits.ai.check(request);
    if (rateLimitError) return rateLimitError;

    const session = await getAuthSession();
    if (session.user.role !== "client") {
      return NextResponse.json({ error: "Only clients can compose projects." }, { status: 403 });
    }

    if (!aiEnabled()) {
      return NextResponse.json({ error: "AI features are currently unavailable." }, { status: 503 });
    }

    const body = await request.json();
    const parsed = aiProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload.", details: parsed.error.format() }, { status: 400 });
    }

    const { brief } = parsed.data;

    const systemPrompt = `You are an expert technical project manager and copywriter helping a client draft a high-quality job post for a freelance marketplace.
The user will provide a rough, unstructured brief. Your job is to transform it into a structured, professional project description.
If the brief is extremely short, nonsensical, or lacks detail, draft a reasonable, generic project post that fits the general idea rather than hallucinating highly specific technical requirements that were never mentioned.
Return the result strictly as a JSON object matching the provided schema.`;

    const userContent = `Rough brief from client:\n${brief}`;

    const jsonString = await generateText({
      systemPrompt,
      userContent,
      responseSchema: projectComposerSchema as any
    });

    const result = JSON.parse(jsonString);

    // Validate the experienceLevel is one of the enum values, default to intermediate if the model messed up
    if (!["beginner", "intermediate", "expert"].includes(result.experienceLevel)) {
      result.experienceLevel = "intermediate";
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof AIUnavailableError) {
      return NextResponse.json({ error: "AI service is currently unavailable. Please try again later." }, { status: 503 });
    }
    console.error("[POST /api/ai/compose/project]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
