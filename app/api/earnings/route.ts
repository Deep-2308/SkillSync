import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { Transaction } from "@/models/Transaction";
import { WithdrawalRequest } from "@/models/WithdrawalRequest";
import mongoose from "mongoose";

/**
 * GET /api/earnings
 * Returns the freelancer's financial dashboard data purely from Transaction rows.
 */
export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    
    if (session.user.role !== "freelancer") {
      return NextResponse.json({ error: "Only freelancers can access earnings." }, { status: 403 });
    }

    await connectToDatabase();
    const freelancerId = new mongoose.Types.ObjectId(session.user.id);

    // 1. Fetch all relevant transactions for this freelancer
    const allTxs = await Transaction.find({ freelancerId }).lean();

    // 2. Compute Lifetime Earned: Sum of all "release" transactions
    const lifetimeEarned = allTxs
      .filter((tx) => tx.type === "release")
      .reduce((sum, tx) => sum + tx.amount, 0);

    // 3. Compute Pending Balance:
    // A contract is pending if it has a funding transaction, but NO release or refund transaction yet.
    // So we group by contractId.
    const fundingByContract = new Map<string, number>();
    const releasedOrRefundedContracts = new Set<string>();

    for (const tx of allTxs) {
      const cid = tx.contractId.toString();
      if (tx.type === "funding") {
        fundingByContract.set(cid, (fundingByContract.get(cid) || 0) + tx.amount);
      } else if (tx.type === "release" || tx.type === "refund") {
        releasedOrRefundedContracts.add(cid);
      }
    }

    let pendingBalance = 0;
    for (const [cid, amount] of fundingByContract.entries()) {
      if (!releasedOrRefundedContracts.has(cid)) {
        pendingBalance += amount;
      }
    }

    // 4. Compute Available Balance: Lifetime Earned - Sum of all Withdrawals
    const withdrawals = await WithdrawalRequest.find({ freelancerId }).lean();
    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);
    const availableBalance = Math.max(0, lifetimeEarned - totalWithdrawn);

    // 5. History: list of recent release transactions
    const history = await Transaction.find({ freelancerId, type: "release" })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("contractId")
      .populate("clientId", "name image")
      .lean();

    // 6. Chart Data: Monthly aggregations of release transactions
    const monthlyData = await Transaction.aggregate([
      { $match: { freelancerId, type: "release" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const chartData = monthlyData.map((d) => {
      const date = new Date(d._id.year, d._id.month - 1);
      return {
        month: date.toLocaleString('default', { month: 'short' }),
        earned: d.total,
      };
    });

    return NextResponse.json({
      data: {
        lifetimeEarned,
        pendingBalance,
        availableBalance,
        history,
        chartData,
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/earnings]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
