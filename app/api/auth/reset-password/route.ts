import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import type { ApiResponse } from "@/types";

import { resetPasswordSchema } from "@/types/schemas";
import { rateLimits } from "@/lib/rate-limit";

/**
 * POST /api/auth/reset-password
 *
 * Validates the raw token by hashing it with SHA-256 and comparing against
 * the stored hash. If valid and not expired, hashes the new password and
 * clears the reset fields.
 *
 * SECURITY: The raw token is never stored — only a SHA-256 hash is persisted.
 * After a successful reset, both the token and expiry are cleared.
 */
export async function POST(request: Request) {
  try {
    const rateLimitError = rateLimits.auth.check(request);
    if (rateLimitError) return rateLimitError;

    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const { token, newPassword } = parsed.data;

    // Hash the incoming raw token to compare with what's stored.
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    await connectToDatabase();

    // Find user with matching hashed token AND non-expired expiry.
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Reset token is invalid or has expired." },
        { status: 400 }
      );
    }

    // Hash the new password and clear reset fields.
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return NextResponse.json<ApiResponse<{ message: string }>>(
      { success: true, data: { message: "Password has been reset successfully." } },
      { status: 200 }
    );
  } catch (error) {
    console.error("[reset-password] Unexpected error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
