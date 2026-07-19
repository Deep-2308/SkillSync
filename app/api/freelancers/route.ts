import { NextResponse } from "next/server";
import type { PipelineStage } from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { parsePagination } from "@/lib/api-utils";

/**
 * GET /api/freelancers — Paginated list of freelancers (providers) with
 * search, filter, and sort query params.
 *
 * Query params:
 *   ?q=react — full-text search on name/skills
 *   &category=webdev — filter by skill category
 *   &minRate=20&maxRate=100 — hourly rate range
 *   &rating=4 — minimum average rating
 *   &sort=rating|reviews|rate|newest — sort field
 *   &page=1&limit=12 — pagination
 */
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const q = searchParams.get("q")?.trim();
    const category = searchParams.get("category")?.trim();
    const minRate = parseFloat(searchParams.get("minRate") ?? "0") || 0;
    const maxRate = parseFloat(searchParams.get("maxRate") ?? "0") || 0;
    const minRating = parseFloat(searchParams.get("rating") ?? "0") || 0;
    const availability = searchParams.get("available");
    const sort = searchParams.get("sort") ?? "newest";

    // Base match: only providers
    const matchStage: Record<string, unknown> = { role: "freelancer" };

    // Text search on name or skills
    if (q) {
      const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const safeQ = escapeRegExp(q);
      matchStage.$or = [
        { name: { $regex: safeQ, $options: "i" } },
        { skills: { $regex: safeQ, $options: "i" } },
        { headline: { $regex: safeQ, $options: "i" } },
      ];
    }

    // Build the aggregation pipeline
    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      // Lookup skills by this provider to compute average rate and ratings
      {
        $lookup: {
          from: "skills",
          localField: "_id",
          foreignField: "providerId",
          as: "skillListings",
        },
      },
      // Compute aggregated fields
      {
        $addFields: {
          averageRate: {
            $cond: [
              { $gt: [{ $size: "$skillListings" }, 0] },
              { $avg: "$skillListings.hourlyRate" },
              0,
            ],
          },
          averageRating: {
            $cond: [
              { $gt: [{ $size: "$skillListings" }, 0] },
              { $avg: "$skillListings.rating" },
              0,
            ],
          },
          totalReviews: {
            $sum: "$skillListings.reviewCount",
          },
          categories: {
            $setUnion: "$skillListings.category",
          },
        },
      },
    ];

    // Post-lookup filters
    const postMatchStage: Record<string, unknown> = {};

    if (category) {
      postMatchStage.categories = category;
    }

    if (minRate > 0) {
      postMatchStage.averageRate = { ...((postMatchStage.averageRate as Record<string, unknown>) ?? {}), $gte: minRate };
    }
    if (maxRate > 0) {
      postMatchStage.averageRate = { ...((postMatchStage.averageRate as Record<string, unknown>) ?? {}), $lte: maxRate };
    }

    if (minRating > 0) {
      postMatchStage.averageRating = { $gte: minRating };
    }

    if (Object.keys(postMatchStage).length > 0) {
      pipeline.push({ $match: postMatchStage });
    }

    // Sort
    const sortStageMap: Record<string, Record<string, 1 | -1>> = {
      rating: { averageRating: -1 },
      reviews: { totalReviews: -1 },
      rate: { averageRate: 1 },
      newest: { createdAt: -1 },
    };
    pipeline.push({ $sort: sortStageMap[sort] ?? { createdAt: -1 } });

    // Project output — exclude sensitive fields and skillListings blob
    pipeline.push({
      $project: {
        passwordHash: 0,
        passwordResetToken: 0,
        passwordResetExpires: 0,
        email: 0,
        emailVerified: 0,
        __v: 0,
        skillListings: 0,
      },
    });

    // Count total (before pagination) via $facet
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    });

    const [result] = await User.aggregate(pipeline);

    const total = result.metadata[0]?.total ?? 0;
    const freelancers = result.data.map((doc: Record<string, unknown>) => ({
      ...doc,
      id: doc._id?.toString(),
      _id: undefined,
    }));

    return NextResponse.json({
      data: {
        freelancers,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/freelancers]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
