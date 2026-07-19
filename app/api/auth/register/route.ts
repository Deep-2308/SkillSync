import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { rateLimiter } from "@/lib/rate-limit";
import { sendEmail, welcomeEmail } from "@/lib/email";
import { User } from "@/models/User";
import type { ApiResponse } from "@/types";

// 5 signups/hour/IP — generous for humans, hostile to bot floods.
const limiter = rateLimiter({ limit: 5, window: 3600 });

/**
 * Server-side registration schema.
 * Extends the shared signUp schema with a role field.
 * confirmPassword is stripped here since the server doesn't need it.
 */
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(80),
  email: z.string().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Include at least one uppercase letter.")
    .regex(/[a-z]/, "Include at least one lowercase letter.")
    .regex(/[0-9]/, "Include at least one number."),
  role: z
    .enum(["client", "freelancer"], {
      errorMap: () => ({ message: "Role must be 'client' or 'freelancer'." }),
    })
    .default("client"),
});

/**
 * POST /api/auth/register — create a new credentials-based account.
 *
 * Validates with Zod, hashes the password with bcrypt (cost 12), and
 * refuses duplicate emails. The hashed password is NEVER returned.
 */
export async function POST(request: Request) {
  try {
    const blocked = limiter.check(request);
    if (blocked) return blocked;

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    await connectToDatabase();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Cost factor 12 balances security and latency for interactive sign-up.
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      emailVerified: null,
    });

    await sendEmail({
      to: email,
      subject: "Welcome to SkillSync!",
      html: welcomeEmail(name),
    });

    return NextResponse.json<ApiResponse<{ id: string }>>(
      { success: true, data: { id: user._id.toString() } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[register] Unexpected error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
