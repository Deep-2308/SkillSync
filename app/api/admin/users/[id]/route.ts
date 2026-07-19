import { NextResponse } from "next/server";
import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/admin";
import { notify } from "@/lib/notifications";
import { adminUserUpdateSchema } from "@/types/schemas";
import { User } from "@/models/User";

/**
 * PUT /api/admin/users/[id] — Update a user's role or ban status (admin only).
 *
 * Safety rails:
 *   - an admin cannot modify their own account (no self-demotion/self-ban)
 *   - banning is soft: the flag gates login/search, the account is preserved
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
    }
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot modify your own account." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = adminUserUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const update: Record<string, unknown> = {};
    if (parsed.data.role !== undefined) update.role = parsed.data.role;
    if (parsed.data.banned !== undefined) {
      update.banned = parsed.data.banned;
      
      if (parsed.data.banned === true) {
        const targetUser = await User.findById(id).select("role");
        if (targetUser?.role === "admin") {
          const activeAdminCount = await User.countDocuments({ role: "admin", banned: { $ne: true } });
          if (activeAdminCount <= 1) {
            return NextResponse.json({ error: "Cannot ban the last remaining admin." }, { status: 400 });
          }
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).select("name email image role banned");

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (parsed.data.role !== undefined) {
      void notify([id], {
        type: "system",
        title: `Your account role is now "${parsed.data.role}".`,
      });
    }

    return NextResponse.json({ data: user.toJSON() });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[PUT /api/admin/users/[id]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
