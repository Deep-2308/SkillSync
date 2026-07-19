import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { Transaction } from "@/models/Transaction";
import { WithdrawalRequest } from "@/models/WithdrawalRequest";
import { z } from "zod";
import mongoose from "mongoose";

const withdrawalSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
});

/**
 * POST /api/withdrawals
 * Creates a withdrawal request if the freelancer has sufficient available balance.
 */
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    
    if (session.user.role !== "freelancer") {
      return NextResponse.json({ error: "Only freelancers can withdraw earnings." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = withdrawalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const { amount } = parsed.data;

    await connectToDatabase();
    const freelancerId = new mongoose.Types.ObjectId(session.user.id);

    // Compute Available Balance
    const allTxs = await Transaction.find({ freelancerId, type: "release" }).lean();
    const lifetimeEarned = allTxs.reduce((sum, tx) => sum + tx.amount, 0);

    const withdrawals = await WithdrawalRequest.find({ freelancerId }).lean();
    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);
    
    const availableBalance = Math.max(0, lifetimeEarned - totalWithdrawn);

    if (amount > availableBalance) {
      return NextResponse.json(
        { error: `Insufficient funds. Available balance is $${availableBalance}.` },
        { status: 400 }
      );
    }

    const withdrawalRequest = await WithdrawalRequest.create({
      freelancerId,
      amount,
      status: "pending",
    });

    return NextResponse.json({ data: withdrawalRequest }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[POST /api/withdrawals]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
