import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
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

    // Send the email via Resend.
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@skillsync.com";

    if (resendApiKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `SkillSync <${fromEmail}>`,
          to: [email],
          subject: "Reset your SkillSync password",
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px;">
              <h2 style="color: #1D4ED8; margin-bottom: 8px;">SkillSync</h2>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
              <h3 style="color: #18181b;">Password Reset Request</h3>
              <p style="color: #52525b; line-height: 1.6;">
                Hi ${user.name},<br><br>
                We received a request to reset your password. Click the button below to create a new password. This link expires in <strong>1 hour</strong>.
              </p>
              <a href="${resetUrl}" style="display: inline-block; background: #1D4ED8; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">
                Reset Password
              </a>
              <p style="color: #71717a; font-size: 14px; line-height: 1.6;">
                If you didn't request this, you can safely ignore this email. Your password won't change.
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px;">
              <p style="color: #a1a1aa; font-size: 12px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #6366f1; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>
          `,
        }),
      });
    } else {
      // Fallback: log the reset URL in development when Resend isn't configured.
      console.log(`[forgot-password] Reset URL for ${email}: ${resetUrl}`);
    }

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
