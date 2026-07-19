import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/admin";
import { WithdrawalRequest } from "@/models/WithdrawalRequest";

export async function GET(request: Request) {
  try {
    await getAdminSession();
    await connectToDatabase();
    
    const withdrawals = await WithdrawalRequest.find()
      .populate("freelancerId", "name email image stripeAccountId")
      .sort({ createdAt: -1 })
      .lean();
      
    return NextResponse.json({ data: withdrawals });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/admin/operations/withdrawals]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
