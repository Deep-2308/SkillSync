import { NextResponse } from "next/server";
import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import { parsePagination } from "@/lib/api-utils";
import { Review } from "@/models/Review";
import { User } from "@/models/User";

/**
 * GET /api/reviews/[id] — Paginated reviews ABOUT a user (the [id] segment is
 * a USER id; it shares the segment name with /api/reviews/[id]/helpful, where
 * it's a review id, because Next.js requires one param name per level).
 *
 * ?page=1&limit=10&sort=recent|helpful
 *
 * The aggregate block (averageRating / totalReviews / ratingBreakdown) is read
 * straight off the denormalized User fields — no aggregation on the read path.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);
    const sort: Record<string, 1 | -1> =
      searchParams.get("sort") === "helpful"
        ? { helpfulCount: -1, createdAt: -1 }
        : { createdAt: -1 };

    await connectToDatabase();

    const [target, reviews, total] = await Promise.all([
      User.findById(userId).select("averageRating totalReviews ratingBreakdown"),
      Review.find({ targetId: userId })
        .populate("reviewerId", "name image headline")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ targetId: userId }),
    ]);

    if (!target) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const targetJson = target.toJSON() as unknown as {
      averageRating: number;
      totalReviews: number;
      ratingBreakdown: Record<string, number>;
    };

    return NextResponse.json({
      data: {
        reviews: reviews.map((r) => r.toJSON()),
        total,
        page,
        pages: Math.ceil(total / limit),
        aggregate: {
          averageRating: targetJson.averageRating ?? 0,
          totalReviews: targetJson.totalReviews ?? 0,
          ratingBreakdown: targetJson.ratingBreakdown ?? {},
        },
      },
    });
  } catch (error) {
    console.error("[GET /api/reviews/[id]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
