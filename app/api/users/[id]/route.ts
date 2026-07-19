import { NextResponse } from "next/server";
import { isValidObjectId } from "@/lib/api-utils";

import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

/**
 * GET /api/users/[id] — Public profile of any user.
 * Excludes sensitive fields (email, passwordHash, etc.).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const badId = isValidObjectId(id);
    if (badId) return badId;

    await connectToDatabase();

    const user = await User.findById(id).select(
      "name image role headline bio location skills createdAt"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ data: user.toJSON() });
  } catch (error) {
    console.error("[GET /api/users/[id]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
