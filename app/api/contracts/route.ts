import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession, parsePagination } from "@/lib/api-utils";
import { Contract } from "@/models/Contract";

/**
 * GET /api/contracts — The caller's contracts, whichever side they're on.
 * ?status=active|completed|cancelled|disputed&page=1&limit=12
 */
export async function GET(request: Request) {
  try {
    const session = await getAuthSession();

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);
    const status = searchParams.get("status")?.trim();

    // Both parties see their own contracts — never anyone else's.
    const filter: Record<string, unknown> = {
      $or: [{ clientId: session.user.id }, { freelancerId: session.user.id }],
    };
    if (status) filter.status = status;

    const [contracts, total] = await Promise.all([
      Contract.find(filter)
        .populate("clientId", "name image headline")
        .populate("freelancerId", "name image headline")
        .populate("projectId", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Contract.countDocuments(filter),
    ]);

    return NextResponse.json({
      data: {
        contracts: contracts.map((c) => c.toJSON()),
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/contracts]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
