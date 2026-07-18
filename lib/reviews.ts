import { Types } from "mongoose";

import { Review } from "@/models/Review";
import { User } from "@/models/User";

/**
 * Recompute a user's review aggregates with a single aggregation pipeline and
 * persist them denormalized on the User document.
 *
 * Called on every review WRITE (create / helpful-toggle doesn't affect rating,
 * so only create + any future edit/delete). Reads never aggregate.
 */
export async function recalculateUserRating(targetId: string): Promise<void> {
  const [agg] = await Review.aggregate<{
    averageRating: number;
    totalReviews: number;
    ratings: number[];
  }>([
    { $match: { targetId: new Types.ObjectId(targetId) } },
    {
      $group: {
        _id: "$targetId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        ratings: { $push: "$rating" },
      },
    },
  ]);

  const breakdown: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  for (const r of agg?.ratings ?? []) {
    breakdown[String(r)] = (breakdown[String(r)] ?? 0) + 1;
  }

  await User.findByIdAndUpdate(targetId, {
    $set: {
      // Store to 2 decimals; 0 when the user has no reviews at all.
      averageRating: agg ? Math.round(agg.averageRating * 100) / 100 : 0,
      totalReviews: agg?.totalReviews ?? 0,
      ratingBreakdown: breakdown,
    },
  });
}
