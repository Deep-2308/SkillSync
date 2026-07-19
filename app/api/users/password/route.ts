import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { User } from "@/models/User";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

/**
 * PUT /api/users/password
 * Changes the current user's password.
 */
export async function PUT(request: Request) {
  try {
    const session = await getAuthSession();
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Account was created via OAuth and does not have a password." },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect current password." },
        { status: 403 }
      );
    }

    user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[PUT /api/users/password]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
