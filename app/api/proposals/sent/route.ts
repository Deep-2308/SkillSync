import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession, parsePagination } from "@/lib/api-utils";
import { Proposal } from "@/models/Proposal";

/**
 * GET /api/proposals/sent — Freelancer sees their sent proposals.
 * Auth required, paginated.
 */
export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const filter = { freelancerId: session.user.id };

    const [proposals, total] = await Promise.all([
      Proposal.find(filter)
        .populate({
          path: "projectId",
          select: "title category status postedBy",
          populate: { path: "postedBy", select: "name image" },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Proposal.countDocuments(filter),
    ]);

    const data = proposals.map((p) => ({
      ...p,
      id: p._id?.toString(),
      _id: undefined,
      __v: undefined,
    }));

    return NextResponse.json({
      data: {
        proposals: data,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/proposals/sent]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
