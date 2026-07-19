import { Metadata } from "next";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Briefcase, CreditCard, Clock, ChevronRight } from "lucide-react";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession, parsePagination } from "@/lib/api-utils";
import { Contract } from "@/models/Contract";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My Contracts | SkillSync",
};

export default async function ContractsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getAuthSession();
  const { status } = await searchParams;
  
  await connectToDatabase();
  
  const filter: any = {
    $or: [{ clientId: session.user.id }, { freelancerId: session.user.id }],
  };
  
  if (status) {
    filter.status = status;
  }

  const rawContracts = await Contract.find(filter)
    .populate("clientId", "name image headline")
    .populate("freelancerId", "name image headline")
    .populate("projectId", "title")
    .sort({ createdAt: -1 })
    .lean();

  const contracts = rawContracts.map(c => ({
    ...c,
    id: c._id.toString(),
    _id: undefined,
  }));

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "active":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Active</span>;
      case "delivered":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Delivered</span>;
      case "completed":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>;
      case "disputed":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">Disputed</span>;
      case "cancelled":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">Cancelled</span>;
      default:
        return null;
    }
  };

  const getPaymentBadge = (p: string) => {
    switch (p) {
      case "paid":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Funded</span>;
      case "pending":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Unpaid</span>;
      case "refunded":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">Refunded</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Contracts</h1>
          <p className="text-muted-foreground mt-1">Manage your active work and payments.</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant={!status ? "default" : "outline"} asChild size="sm">
            <Link href="/contracts">All</Link>
          </Button>
          <Button variant={status === "active" ? "default" : "outline"} asChild size="sm">
            <Link href="/contracts?status=active">Active</Link>
          </Button>
          <Button variant={status === "completed" ? "default" : "outline"} asChild size="sm">
            <Link href="/contracts?status=completed">Completed</Link>
          </Button>
        </div>
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-20 px-4 bg-card rounded-2xl border border-dashed">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No contracts found</h3>
          <p className="text-muted-foreground">
            {status ? `You don't have any ${status} contracts right now.` : "You don't have any active contracts yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract: any) => {
            const isClient = contract.clientId._id?.toString() === session.user.id || contract.clientId === session.user.id;
            const otherParty = isClient ? contract.freelancerId : contract.clientId;
            
            return (
              <Link 
                key={contract.id} 
                href={`/contracts/${contract.id}`}
                className="bg-card border rounded-xl p-5 hover:border-brand/40 hover:shadow-sm transition-all group flex flex-col md:flex-row md:items-center gap-6"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(contract.status)}
                    {getPaymentBadge(contract.paymentStatus)}
                    <span className="text-xs text-muted-foreground flex items-center gap-1 ml-2">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(contract.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <h2 className="text-lg font-bold text-foreground group-hover:text-brand transition-colors">
                    {contract.projectId?.title || "Direct Contract"}
                  </h2>
                  
                  <div className="flex items-center gap-3">
                    {otherParty?.image ? (
                      <img src={otherParty.image} alt={otherParty.name} className="w-8 h-8 rounded-full border" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-bold border">
                        {otherParty?.name?.[0] || "?"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        <span className="text-muted-foreground mr-1">{isClient ? "Freelancer:" : "Client:"}</span>
                        {otherParty?.name || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 md:w-64 shrink-0 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Agreed Rate</p>
                    <p className="text-xl font-bold">${contract.agreedRate}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-brand/5 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
