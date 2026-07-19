import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/admin";
import { Review } from "@/models/Review";

export async function GET(request: Request) {
  try {
    await getAdminSession();
    await connectToDatabase();
    
    // Only return flagged reviews for the anomaly check queue
    const reviews = await Review.find({ flaggedForReview: true })
      .populate("reviewerId", "name email image")
      .populate("targetId", "name email image")
      .sort({ createdAt: -1 })
      .lean();
      
    return NextResponse.json({ data: reviews });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/admin/content/reviews]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
