import { NextResponse } from "next/server";
import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { notify } from "@/lib/notifications";
import { sendEmail, reviewReceivedEmail } from "@/lib/email";
import { recalculateUserRating } from "@/lib/reviews";
import { reviewSchema } from "@/types/schemas";
import { Review } from "@/models/Review";
import { Contract } from "@/models/Contract";
import { User } from "@/models/User";
import { runReviewAnomalyCheck } from "@/lib/ai/anomaly-check";

/**
 * POST /api/reviews — Submit a review for the other party of a contract.
 *
 * Guards, in order:
 *   1. Contract exists and is "completed" (you can't review live work)
 *   2. Reviewer is a party to the contract (client or freelancer)
 *   3. Target is the OTHER party (derived server-side, but validated against
 *      the submitted targetId to catch client bugs)
 *   4. No duplicate review — checked here for a friendly error, but the
 *      unique index on (contractId, reviewerId) is the race-proof guarantee
 *
 * After save: the target user's averageRating / totalReviews /
 * ratingBreakdown are recalculated with ONE aggregation pipeline and written
 * back to the User document — write-time denormalization, so reads are free.
 */
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const { targetId, contractId, rating, comment } = parsed.data;

    if (!Types.ObjectId.isValid(contractId) || !Types.ObjectId.isValid(targetId)) {
      return NextResponse.json({ error: "Invalid id format." }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Contract must exist and be completed.
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return NextResponse.json({ error: "Contract not found." }, { status: 404 });
    }
    if (contract.status !== "completed") {
      return NextResponse.json(
        { error: "You can only review a completed contract." },
        { status: 400 }
      );
    }

    // 2. Reviewer must be a party to the contract.
    const me = session.user.id;
    const client = contract.clientId.toString();
    const freelancer = contract.freelancerId.toString();
    if (me !== client && me !== freelancer) {
      return NextResponse.json(
        { error: "You are not a party to this contract." },
        { status: 403 }
      );
    }

    // 3. The target must be the other party.
    const expectedTarget = me === client ? freelancer : client;
    if (targetId !== expectedTarget) {
      return NextResponse.json(
        { error: "Target user does not match the other party of this contract." },
        { status: 400 }
      );
    }

    // 4. Friendly duplicate check (the unique index still wins any race).
    const existing = await Review.findOne({ contractId, reviewerId: me });
    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this contract." },
        { status: 409 }
      );
    }

    let review;
    try {
      review = await Review.create({
        contractId,
        reviewerId: me,
        targetId,
        rating,
        comment,
      });
    } catch (error) {
      // E11000 = unique index violation — a concurrent duplicate submit.
      if ((error as { code?: number }).code === 11000) {
        return NextResponse.json(
          { error: "You have already reviewed this contract." },
          { status: 409 }
        );
      }
      throw error;
    }

    // Recalculate the target's aggregates (write-time, per the platform rule).
    await recalculateUserRating(targetId);

    void notify([targetId], {
      type: "review_received",
      title: "You received a new review",
      body: `${session.user.name ?? "Someone"} rated you ${rating}/5.`,
      link: `/freelancers/${targetId}`,
    });
    
    // Clear AI review digest cache so it regenerates on next profile view
    await User.findByIdAndUpdate(targetId, { $set: { reviewDigest: null } });

    // Kick off background anomaly check
    void runReviewAnomalyCheck(review.id, comment, rating);
    
    // Fetch target user's email for notification
    const targetUser = await User.findById(targetId).select("email");
    if (targetUser) {
      sendEmail({
        to: targetUser.email,
        subject: `New Review Received`,
        html: reviewReceivedEmail(session.user.name || "A user"),
        category: "reviews",
      }).catch(console.error);
    }

    return NextResponse.json({ data: review.toJSON() }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[POST /api/reviews]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
