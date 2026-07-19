import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/api-utils";
import { generateText, aiEnabled, aiRateLimiter, AIUnavailableError } from "@/lib/ai";
import { SchemaType } from "@google/generative-ai";
import { z } from "zod";

const requestSchema = z.object({
  headline: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
});

const profileComposerSchema = {
  type: SchemaType.OBJECT,
  properties: {
    suggestions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: { type: SchemaType.STRING, description: "Must be 'headline', 'bio', or 'skills'." },
          text: { type: SchemaType.STRING, description: "The suggested text to apply, or a prompt about missing skills." },
          rationale: { type: SchemaType.STRING, description: "Why this suggestion improves the profile." }
        },
        required: ["type", "text", "rationale"]
      }
    }
  },
  required: ["suggestions"]
};

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (session.user.role !== "freelancer") {
      return NextResponse.json({ error: "Only freelancers can optimize their profiles." }, { status: 403 });
    }

    if (!aiEnabled()) {
      return NextResponse.json({ error: "AI features are currently unavailable." }, { status: 503 });
    }

    const rateLimitResponse = await aiRateLimiter.check(request, session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload.", details: parsed.error.format() }, { status: 400 });
    }

    const { headline, bio } = parsed.data;

    const systemPrompt = `You are an expert personal branding coach for freelancers.
The user will provide their current profile headline and bio.
Your job is to provide concrete rewrite suggestions for the headline and bio to make them more compelling and professional, and a suggestion about missing but relevant skills if applicable.
Return exactly one suggestion for the headline, one suggestion for the bio, and optionally one suggestion for skills.
Return the result strictly as a JSON object matching the provided schema.`;

    const userContent = `Current Headline: ${headline || "Not provided"}
Current Bio: ${bio || "Not provided"}`;

    const jsonString = await generateText({
      systemPrompt,
      userContent,
      responseSchema: profileComposerSchema as any
    });

    const result = JSON.parse(jsonString);

    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof AIUnavailableError) {
      return NextResponse.json({ error: "AI service is currently unavailable. Please try again later." }, { status: 503 });
    }
    console.error("[POST /api/ai/compose/profile]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
