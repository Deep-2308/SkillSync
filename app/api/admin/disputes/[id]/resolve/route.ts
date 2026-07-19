import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/admin";
import { Contract } from "@/models/Contract";
import { Transaction } from "@/models/Transaction";
import { notify } from "@/lib/notifications";
import { Types } from "mongoose";

export async function POST(
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
    const { resolution, auditNote } = body; // resolution: "completed" or "cancelled"
    
    if (resolution !== "completed" && resolution !== "cancelled") {
      return NextResponse.json({ error: "Invalid resolution status" }, { status: 400 });
    }

    const contract = await Contract.findById(id);
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }
    
    if (contract.status !== "disputed") {
      return NextResponse.json({ error: "Contract is not in disputed state" }, { status: 400 });
    }
    
    const clientStr = contract.clientId.toString();
    const freelancerStr = contract.freelancerId.toString();

    // Idempotent completion check handled by the status check above
    contract.status = resolution;
    contract.disputeReason = (contract.disputeReason || "") + `\n\n[Admin Resolution]: ${auditNote}`;
    
    if (resolution === "completed") {
      if (contract.paymentStatus === "paid") {
        const existingRelease = await Transaction.findOne({ contractId: contract._id, type: "release" });
        if (!existingRelease) {
          const fundingTx = await Transaction.findOne({ contractId: contract._id, type: "funding" });
          if (fundingTx) {
            await Transaction.create({
               contractId: contract._id,
               clientId: contract.clientId,
               freelancerId: contract.freelancerId,
               amount: contract.agreedRate,
               type: "release",
               stripePaymentIntentId: fundingTx.stripePaymentIntentId,
            });
          }
        }
      }
      
      void notify([clientStr, freelancerStr], {
        type: "system",
        title: "Dispute Resolved in Favor of Freelancer",
        body: "The disputed contract was marked as completed. Funds will be released.",
        link: `/projects/${contract.projectId}`,
      });
      
    } else if (resolution === "cancelled") {
      if (contract.paymentStatus === "paid") {
        contract.paymentStatus = "refunded";
        const existingRefund = await Transaction.findOne({ contractId: contract._id, type: "refund" });
        if (!existingRefund) {
          const fundingTx = await Transaction.findOne({ contractId: contract._id, type: "funding" });
          if (fundingTx) {
            await Transaction.create({
               contractId: contract._id,
               clientId: contract.clientId,
               freelancerId: contract.freelancerId,
               amount: contract.agreedRate,
               type: "refund",
               stripePaymentIntentId: fundingTx.stripePaymentIntentId,
            });
          }
        }
      }
      
      void notify([clientStr, freelancerStr], {
        type: "system",
        title: "Dispute Resolved in Favor of Client",
        body: "The disputed contract was cancelled. Funds will be refunded.",
        link: `/projects/${contract.projectId}`,
      });
    }

    await contract.save();
    return NextResponse.json({ success: true, data: contract });
    
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[POST /api/admin/disputes/[id]/resolve]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
