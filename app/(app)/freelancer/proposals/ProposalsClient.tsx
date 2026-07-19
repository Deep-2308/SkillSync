"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  DollarSign,
  Clock,
  CheckCircle2,
  XOctagon,
  MoreVertical,
  Loader2,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Proposal = {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  proposedRate: number;
  message: string;
  status: string;
  createdAt: string;
};

interface ProposalsClientProps {
  initialProposals: Proposal[];
}

export function ProposalsClient({ initialProposals }: ProposalsClientProps) {
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [proposalToWithdraw, setProposalToWithdraw] = useState<Proposal | null>(null);

  const pending = proposals.filter((p) => p.status === "pending");
  const accepted = proposals.filter((p) => p.status === "accepted");
  const rejected = proposals.filter((p) => p.status === "rejected");
  const withdrawn = proposals.filter((p) => p.status === "withdrawn");

  const handleWithdraw = async () => {
    if (!proposalToWithdraw) return;
    
    setIsWithdrawing(true);
    setWithdrawError(null);

    try {
      const res = await fetch(`/api/proposals/${proposalToWithdraw.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "withdrawn" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to withdraw proposal.");
      }

      // Update local state
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalToWithdraw.id ? { ...p, status: "withdrawn" } : p
        )
      );
      setProposalToWithdraw(null);
    } catch (err: any) {
      setWithdrawError(err.message || "An error occurred.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "accepted":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "rejected":
        return <XOctagon className="w-5 h-5 text-destructive" />;
      case "withdrawn":
        return <XOctagon className="w-5 h-5 text-muted-foreground" />;
      default:
        return <FileText className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const renderList = (list: Proposal[], emptyMessage: string) => {
    if (list.length === 0) {
      return (
        <div className="py-20 text-center border-2 border-dashed rounded-2xl bg-muted/30">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Proposals</h3>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {list.map((proposal) => (
          <div key={proposal.id} className="bg-card rounded-2xl border p-6 flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(proposal.status)}
                <Link href={`/projects/${proposal.projectId}`} className="hover:underline">
                  <h3 className="text-xl font-bold text-foreground truncate">{proposal.projectTitle}</h3>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Client: {proposal.clientName} &bull; Submitted {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
              </p>
              
              <div className="bg-muted rounded-lg p-4 mb-4">
                <p className="text-sm text-foreground/80 line-clamp-3 italic">
                  "{proposal.message}"
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                Bid: ${proposal.proposedRate}
              </div>
            </div>

            <div className="flex-shrink-0 flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0 justify-end">
              <Button variant="outline" asChild>
                <Link href={`/projects/${proposal.projectId}`}>View Project</Link>
              </Button>
              
              {proposal.status === "pending" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
                      onClick={() => setProposalToWithdraw(proposal)}
                    >
                      Withdraw Proposal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Proposals</h1>
        <p className="text-muted-foreground">Manage your submitted project bids.</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-4 max-w-[600px]">
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({accepted.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
          <TabsTrigger value="withdrawn">Withdrawn ({withdrawn.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {renderList(pending, "You have no pending proposals.")}
        </TabsContent>
        <TabsContent value="accepted">
          {renderList(accepted, "You have no accepted proposals.")}
        </TabsContent>
        <TabsContent value="rejected">
          {renderList(rejected, "You have no rejected proposals.")}
        </TabsContent>
        <TabsContent value="withdrawn">
          {renderList(withdrawn, "You have no withdrawn proposals.")}
        </TabsContent>
      </Tabs>

      <Dialog open={!!proposalToWithdraw} onOpenChange={(open) => !open && !isWithdrawing && setProposalToWithdraw(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Proposal</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw your proposal for "{proposalToWithdraw?.projectTitle}"? 
              This action cannot be undone, and you will not be able to apply to this project again.
            </DialogDescription>
          </DialogHeader>
          
          {withdrawError && (
            <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {withdrawError}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setProposalToWithdraw(null)} disabled={isWithdrawing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleWithdraw} disabled={isWithdrawing}>
              {isWithdrawing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Withdrawing...</> : "Withdraw"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
