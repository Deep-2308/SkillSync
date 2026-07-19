import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/admin";
import { Review } from "@/models/Review";
import { Types } from "mongoose";
import { recalculateUserRating } from "@/lib/reviews";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAdminSession();
    await connectToDatabase();
    const { id } = await params;
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await request.json();
    const action = body.action; // 'approve' or 'remove'
    
    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    
    if (action === "approve") {
      review.flaggedForReview = false;
      await review.save();
      return NextResponse.json({ success: true, data: review });
    } else if (action === "remove") {
      await Review.findByIdAndDelete(id);
      await recalculateUserRating(review.targetId.toString());
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[PATCH /api/admin/content/reviews/[id]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
