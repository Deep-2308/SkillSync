import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { Clock, DollarSign, Calendar, ShieldAlert } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { Contract } from "@/models/Contract";
import { Review } from "@/models/Review";
import { ContractWorkspaceClient } from "./ContractWorkspaceClient";

export const metadata: Metadata = {
  title: "Contract Workspace | SkillSync",
};

export default async function ContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAuthSession();
  const { id } = await params;
  
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    notFound();
  }

  await connectToDatabase();
  
  const rawContract = await Contract.findById(id)
    .populate("clientId", "name image headline")
    .populate("freelancerId", "name image headline")
    .populate("projectId", "title")
    .lean();

  if (!rawContract) {
    notFound();
  }
  
  const isParty = 
    rawContract.clientId?._id?.toString() === session.user.id || 
    rawContract.freelancerId?._id?.toString() === session.user.id;
    
  if (!isParty) {
    return (
      <div className="container py-20 text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">You are not a party to this contract.</p>
      </div>
    );
  }

  const contract = {
    ...rawContract,
    id: rawContract._id.toString(),
    _id: rawContract._id.toString(),
    clientId: {
      ...rawContract.clientId,
      id: rawContract.clientId?._id?.toString(),
      _id: rawContract.clientId?._id?.toString(),
    },
    freelancerId: {
      ...rawContract.freelancerId,
      id: rawContract.freelancerId?._id?.toString(),
      _id: rawContract.freelancerId?._id?.toString(),
    }
  };

  const reviews = await Review.find({ contractId: rawContract._id });
  const myReview = reviews.find(r => r.reviewerId.toString() === session.user.id);
  const theirReview = reviews.find(r => r.reviewerId.toString() !== session.user.id);

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "active":
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">Active</span>;
      case "delivered":
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">Delivered</span>;
      case "completed":
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>;
      case "disputed":
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200">Disputed</span>;
      case "cancelled":
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200">Cancelled</span>;
      default:
        return null;
    }
  };

  const getPaymentBadge = (p: string) => {
    switch (p) {
      case "paid":
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Funded</span>;
      case "pending":
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">Unpaid</span>;
      case "refunded":
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200">Refunded</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-card rounded-2xl border p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {getStatusBadge(contract.status)}
              {getPaymentBadge(contract.paymentStatus)}
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {((contract.projectId as any)?.title) || "Direct Contract"}
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Started {formatDistanceToNow(new Date(contract.createdAt), { addSuffix: true })}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 bg-muted/30 p-4 rounded-xl border border-dashed shrink-0">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Agreed Rate</p>
              <p className="text-2xl font-bold text-foreground flex items-center gap-1">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                {contract.agreedRate}
              </p>
            </div>
            <div className="hidden sm:block w-px bg-border"></div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Est. Timeline</p>
              <p className="text-lg font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {contract.timeline.replace(/_/g, " ")}
              </p>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-transparent hover:border-border transition-colors">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 bg-muted shrink-0">
              {(contract.clientId as any)?.image ? (
                <img src={(contract.clientId as any).image} alt="Client" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground">
                  {(contract.clientId as any)?.name?.[0] || "C"}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-brand tracking-wider uppercase mb-0.5">Client</p>
              <Link href={`/freelancers/${(contract.clientId as any)?._id}`} className="font-bold text-foreground hover:underline">
                {(contract.clientId as any)?.name || "Unknown"}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-transparent hover:border-border transition-colors">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 bg-muted shrink-0">
              {(contract.freelancerId as any)?.image ? (
                <img src={(contract.freelancerId as any).image} alt="Freelancer" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground">
                  {(contract.freelancerId as any)?.name?.[0] || "F"}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-brand tracking-wider uppercase mb-0.5">Freelancer</p>
              <Link href={`/freelancers/${(contract.freelancerId as any)?._id}`} className="font-bold text-foreground hover:underline">
                {(contract.freelancerId as any)?.name || "Unknown"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ContractWorkspaceClient 
        contract={contract} 
        currentUserId={session.user.id} 
        myReview={myReview ? myReview.toJSON() : null}
        theirReview={theirReview ? theirReview.toJSON() : null}
      />

    </div>
  );
}
