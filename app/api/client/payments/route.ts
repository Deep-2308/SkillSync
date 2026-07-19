import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { Transaction } from "@/models/Transaction";
import mongoose from "mongoose";

/**
 * GET /api/client/payments
 * Returns the client's financial dashboard data purely from Transaction rows.
 */
export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    
    // Allow both roles just in case, but typically used by clients. 
    // The query is isolated to the session user's clientId.
    
    await connectToDatabase();
    const clientId = new mongoose.Types.ObjectId(session.user.id);

    const transactions = await Transaction.find({ clientId, type: { $in: ["funding", "refund"] } })
      .sort({ createdAt: -1 })
      .populate("contractId")
      .populate("freelancerId", "name image")
      .lean();

    let totalSpent = 0;
    
    const history = transactions.map((tx) => {
      if (tx.type === "funding") {
        totalSpent += tx.amount;
      } else if (tx.type === "refund") {
        totalSpent -= tx.amount;
      }
      return tx;
    });

    return NextResponse.json({
      data: {
        totalSpent,
        history,
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/client/payments]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
