import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/admin";
import { isValidObjectId } from "@/lib/api-utils";
import { WithdrawalRequest } from "@/models/WithdrawalRequest";
import { notify } from "@/lib/notifications";
import { Types } from "mongoose";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAdminSession();
    await connectToDatabase();
    const { id } = await params;
    const badId = isValidObjectId(id);
    if (badId) return badId;

    const body = await request.json();
    const { status, adminNote } = body;
    
    if (status !== "processed" && status !== "rejected") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const withdrawal = await WithdrawalRequest.findById(id);
    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 });
    }
    
    if (withdrawal.status !== "pending") {
      return NextResponse.json({ error: "Withdrawal is already processed" }, { status: 400 });
    }
    
    withdrawal.status = status;
    if (adminNote) {
      withdrawal.adminNote = adminNote;
    }
    
    await withdrawal.save();
    
    void notify([withdrawal.freelancerId.toString()], {
      type: "system",
      title: `Withdrawal ${status === "processed" ? "Processed" : "Rejected"}`,
      body: status === "processed" 
        ? `Your withdrawal of $${withdrawal.amount} has been processed successfully.` 
        : `Your withdrawal was rejected. ${adminNote || ""}`,
      link: `/settings`,
    });
    
    return NextResponse.json({ success: true, data: withdrawal });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[PATCH /api/admin/operations/withdrawals/[id]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
