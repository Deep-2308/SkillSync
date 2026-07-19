import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/api-utils";
import { generateText, aiEnabled, AIUnavailableError } from "@/lib/ai";
import { User } from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

/**
 * POST /api/ai/health
 * Admin-only route to check Gemini API health.
 * Performs a trivial generation to confirm the integration is configured
 * and the network is reachable.
 */
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    await connectToDatabase();
    const user = await User.findById(session.user.id).select("role");

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    if (!aiEnabled()) {
      return NextResponse.json({ 
        status: "disabled", 
        message: "AI is currently disabled or the GEMINI_API_KEY is not set." 
      }, { status: 200 });
    }

    const result = await generateText({
      systemPrompt: "You are a health check bot. Respond with exactly the word OK.",
      userContent: "Ping",
    });

    return NextResponse.json({ 
      status: "healthy",
      result: result.trim() 
    }, { status: 200 });
    
  } catch (error) {
    console.error("[POST /api/ai/health]", error);
    if (error instanceof AIUnavailableError) {
      return NextResponse.json({ 
        status: "unavailable", 
        error: error.message 
      }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
