import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { rateLimiter } from "@/lib/rate-limit";
import { Contact } from "@/models/Contact";

// Fast in-memory guard (10/min/IP) in front of the durable DB-backed
// 3/hour limit below — floods get bounced before touching Mongo.
const limiter = rateLimiter({ limit: 10, window: 60 });

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(80),
  email: z.string().email("Invalid email address."),
  subject: z.string().min(2, "Subject must be at least 2 characters.").max(200),
  message: z.string().min(10, "Message must be at least 10 characters.").max(5000),
});

/**
 * POST /api/contact
 * Handles contact form submissions with IP-based rate limiting.
 * Rate limit: max 3 submissions per hour per IP.
 */
export async function POST(request: Request) {
  try {
    const blocked = limiter.check(request);
    if (blocked) return blocked;

    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    // Determine client IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    await connectToDatabase();

    // Enforce rate limit (max 3 per hour per IP)
    if (ip !== "unknown") {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentSubmissions = await Contact.countDocuments({
        ip,
        createdAt: { $gte: oneHourAgo },
      });

      if (recentSubmissions >= 3) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
    }

    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      ip,
    });

    return NextResponse.json({ data: { message: "Message sent successfully." } }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/contact]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
