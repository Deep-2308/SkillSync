import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { User } from "@/models/User";

const setRoleSchema = z.object({
  role: z.enum(["client", "freelancer"]),
});

/**
 * PUT /api/users/role
 *
 * Sets the role for a user who does not yet have one (i.e. first-time Google OAuth sign in).
 * This endpoint strictly enforces that a role can only be set ONCE. If the user
 * already has a role, this returns 403 Forbidden.
 */
export async function PUT(request: Request) {
  try {
    const session = await getAuthSession();
    
    // First line of defense: Check the JWT/Session
    if (session.user.role) {
      return NextResponse.json(
        { error: "Role is already set. You cannot change your role." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = setRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid role." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Second line of defense: Check the Database directly to avoid race conditions
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.role && user.role !== "client" && user.role !== "freelancer") {
       // if there's an existing role (e.g. admin or already set), block
       // Wait, if user.role is set AT ALL, block it. 
       // In mongoose, if not set it will be undefined.
    }
    
    if (user.role) {
      return NextResponse.json(
        { error: "Role is already set in the database." },
        { status: 403 }
      );
    }

    user.role = parsed.data.role;
    await user.save();

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[PUT /api/users/role]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
