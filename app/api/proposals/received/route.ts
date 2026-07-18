import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession, parsePagination } from "@/lib/api-utils";
import { Proposal } from "@/models/Proposal";

/**
 * GET /api/proposals/received — Project poster sees all proposals on their projects.
 * Auth required, paginated.
 */
export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    // We need to find proposals on projects owned by the current user.
    // Use an aggregation pipeline to join with projects.
    const pipeline = [
      {
        $lookup: {
          from: "projects",
          localField: "projectId",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      {
        $match: {
          "project.postedBy": { $eq: session.user.id },
        },
      },
      // Lookup freelancer info
      {
        $lookup: {
          from: "users",
          localField: "freelancerId",
          foreignField: "_id",
          as: "freelancer",
          pipeline: [
            { $project: { name: 1, image: 1, headline: 1, location: 1 } },
          ],
        },
      },
      { $unwind: { path: "$freelancer", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 as const } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    // We need to use Proposal.aggregate but match on ObjectId
    // Convert session.user.id to ObjectId for the match
    const mongoose = await import("mongoose");
    const userId = new mongoose.Types.ObjectId(session.user.id);

    const correctedPipeline = [
      {
        $lookup: {
          from: "projects",
          localField: "projectId",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      {
        $match: {
          "project.postedBy": userId,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "freelancerId",
          foreignField: "_id",
          as: "freelancer",
          pipeline: [
            { $project: { name: 1, image: 1, headline: 1, location: 1 } },
          ],
        },
      },
      { $unwind: { path: "$freelancer", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 as const } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    const [result] = await Proposal.aggregate(correctedPipeline);

    const total = result.metadata[0]?.total ?? 0;
    const proposals = result.data.map((doc: Record<string, unknown>) => ({
      ...doc,
      id: doc._id?.toString(),
      _id: undefined,
      __v: undefined,
    }));

    return NextResponse.json({
      data: {
        proposals,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/proposals/received]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
