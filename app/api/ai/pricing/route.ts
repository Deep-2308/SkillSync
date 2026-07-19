import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/api-utils";
import { generateText, aiEnabled, aiRateLimiter, AIUnavailableError } from "@/lib/ai";
import { SchemaType } from "@google/generative-ai";
import { z } from "zod";

const requestSchema = z.object({
  contextType: z.enum(["project", "proposal"]),
  // For project context
  category: z.string().optional(),
  skills: z.array(z.string()).optional(),
  // For proposal context
  projectBudget: z.string().optional(),
  freelancerRate: z.number().optional(),
});

const pricingSchema = {
  type: SchemaType.OBJECT,
  properties: {
    min: { type: SchemaType.INTEGER, description: "The minimum suggested rate or budget in USD." },
    max: { type: SchemaType.INTEGER, description: "The maximum suggested rate or budget in USD." },
    rationale: { type: SchemaType.STRING, description: "A concise, one-line rationale explaining why this range is appropriate based on market rates or the gap between the budget and the freelancer's rate." }
  },
  required: ["min", "max", "rationale"]
};

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
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

    const { contextType, category, skills, projectBudget, freelancerRate } = parsed.data;

    let systemPrompt = "";
    let userContent = "";

    if (contextType === "project") {
      if (session.user.role !== "client") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      systemPrompt = `You are a freelance marketplace pricing expert. Given a project category and skills, suggest a realistic market budget range (min and max) for a typical fixed-price project, along with a one-line rationale.`;
      userContent = `Category: ${category}\nSkills: ${skills?.join(", ")}`;
    } else {
      if (session.user.role !== "freelancer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      systemPrompt = `You are a freelance negotiation expert. Given the client's stated budget for a project and the freelancer's base hourly rate, suggest a strategic bid range (min and max) that bridges the gap or is highly competitive, along with a one-line rationale. Note: Return numbers that could make sense either as an hourly rate or a fixed total, depending on the client's budget type. If the client budget is fixed, suggest a fixed amount. If hourly, suggest an hourly rate.`;
      userContent = `Client's Budget: ${projectBudget}\nFreelancer's Hourly Rate: $${freelancerRate}/hr`;
    }

    const jsonString = await generateText({
      systemPrompt,
      userContent,
      responseSchema: pricingSchema as any
    });

    const result = JSON.parse(jsonString);

    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof AIUnavailableError) {
      return NextResponse.json({ error: "AI service is currently unavailable. Please try again later." }, { status: 503 });
    }
    console.error("[POST /api/ai/pricing]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
