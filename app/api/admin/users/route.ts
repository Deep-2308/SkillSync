import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/admin";
import { parsePagination } from "@/lib/api-utils";
import { User } from "@/models/User";

/**
 * GET /api/admin/users — Paginated user list (admin only).
 * ?q=search&role=client|freelancer|admin&banned=true|false&page=1&limit=20
 */
export async function GET(request: Request) {
  try {
    await getAdminSession();
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const q = searchParams.get("q")?.trim();
    const role = searchParams.get("role")?.trim();
    const banned = searchParams.get("banned");

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (banned === "true") filter.banned = true;
    if (banned === "false") filter.banned = { $ne: true };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        // Email is intentionally included — this is the admin surface.
        .select("name email image role banned averageRating totalReviews createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return NextResponse.json({
      data: {
        users: users.map((u) => u.toJSON()),
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/admin/users]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
