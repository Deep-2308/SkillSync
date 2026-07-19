import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { sendEmail, passwordResetEmail } from "@/lib/email";
import { User } from "@/models/User";
import type { ApiResponse } from "@/types";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

/**
 * POST /api/auth/forgot-password
 *
 * Generates a cryptographically secure reset token, stores the SHA-256 hash
 * on the user document (with a 1-hour expiry), and sends the raw token in a
 * reset link via Resend.
 *
 * SECURITY: Always returns 200 regardless of whether the email exists to
 * prevent user enumeration attacks.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    await connectToDatabase();

    const user = await User.findOne({ email });

    // Even if user doesn't exist, respond with 200 to prevent enumeration.
    if (!user) {
      return NextResponse.json<ApiResponse<{ message: string }>>(
        { success: true, data: { message: "If an account with that email exists, a reset link has been sent." } },
        { status: 200 }
      );
    }

    // Generate a cryptographically secure token.
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store the SHA-256 hash of the token — never store raw tokens in the DB.
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Set token and expiry (1 hour from now) on the user document.
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Build the reset URL.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    // Send the email via our utility
    sendEmail({
      to: email,
      subject: "Reset your SkillSync password",
      html: passwordResetEmail(resetUrl, user.name),
      category: "system",
    }).catch(console.error);

    return NextResponse.json<ApiResponse<{ message: string }>>(
      { success: true, data: { message: "If an account with that email exists, a reset link has been sent." } },
      { status: 200 }
    );
  } catch (error) {
    console.error("[forgot-password] Unexpected error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
