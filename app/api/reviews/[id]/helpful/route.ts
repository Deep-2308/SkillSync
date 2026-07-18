import { NextResponse } from "next/server";
import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { Review } from "@/models/Review";

/**
 * POST /api/reviews/[id]/helpful — Toggle the caller's "helpful" flag on a
 * review. ([id] here is a REVIEW id.)
 *
 * Toggle is race-safe: instead of read-modify-write we issue a conditional
 * $addToSet, and if nothing changed (already voted) we $pull. helpfulCount is
 * maintained in the same atomic update as the set mutation.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid review id." }, { status: 400 });
    }

    await connectToDatabase();

    const userId = new Types.ObjectId(session.user.id);

    // Attempt to ADD the vote; matches only if the user hasn't voted yet.
    const added = await Review.findOneAndUpdate(
      { _id: id, helpfulBy: { $ne: userId } },
      { $addToSet: { helpfulBy: userId }, $inc: { helpfulCount: 1 } },
      { new: true }
    );

    if (added) {
      return NextResponse.json({
        data: { helpful: true, helpfulCount: added.helpfulCount },
      });
    }

    // Either the review doesn't exist, or the user already voted → try REMOVE.
    const removed = await Review.findOneAndUpdate(
      { _id: id, helpfulBy: userId },
      { $pull: { helpfulBy: userId }, $inc: { helpfulCount: -1 } },
      { new: true }
    );

    if (removed) {
      return NextResponse.json({
        data: { helpful: false, helpfulCount: removed.helpfulCount },
      });
    }

    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[POST /api/reviews/[id]/helpful]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
