import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Contract } from "@/models/Contract";
import { Review } from "@/models/Review";
import { notify } from "@/lib/notifications";

// This endpoint is meant to be hit by a serverless cron job (e.g. Vercel Cron, GitHub Actions)
export async function GET(request: Request) {
  try {
    // Optional: add a secret check to prevent unauthorized triggering
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();

    // Find contracts completed roughly 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

    const contracts = await Contract.find({
      status: "completed",
      updatedAt: { $lte: threeDaysAgo, $gt: fourDaysAgo }
    });

    const notificationsToSend: { userId: any; payload: any }[] = [];

    for (const contract of contracts) {
      // Check if freelancer left a review
      const freelancerReview = await Review.findOne({
        contractId: contract._id,
        reviewerId: contract.freelancerId
      });

      if (!freelancerReview) {
        notificationsToSend.push({
          userId: contract.freelancerId,
          payload: {
            type: "review_prompt",
            title: "Action Required: Leave a Review",
            body: `Your contract was completed 3 days ago. How was your experience? Leave a review for the client.`,
            link: `/contracts/${contract._id}`,
          }
        });
      }

      // Check if client left a review
      const clientReview = await Review.findOne({
        contractId: contract._id,
        reviewerId: contract.clientId
      });

      if (!clientReview) {
        notificationsToSend.push({
          userId: contract.clientId,
          payload: {
            type: "review_prompt",
            title: "Action Required: Leave a Review",
            body: `Your contract was completed 3 days ago. Don't forget to review the freelancer!`,
            link: `/contracts/${contract._id}`,
          }
        });
      }
    }

    if (notificationsToSend.length > 0) {
      for (const { userId, payload } of notificationsToSend) {
        void notify([userId], payload);
      }
    }

    return NextResponse.json({ 
      success: true, 
      scannedContracts: contracts.length,
      notificationsSent: notificationsToSend.length 
    });
  } catch (error) {
    console.error("[CRON_REVIEWS]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
