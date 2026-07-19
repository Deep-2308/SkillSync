"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Clock, Star, DollarSign, UserCircle, CheckCircle2, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MessageButton } from "@/components/messages/MessageButton";
import { RatingDisplay } from "@/components/shared/RatingDisplay";

type ProposalActionCardProps = {
  proposal: any;
  projectStatus: string;
};

export function ProposalActionCard({ proposal, projectStatus }: ProposalActionCardProps) {
  const router = useRouter();
  
  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  
  const [clientNote, setClientNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const freelancer = proposal.freelancerId || proposal.freelancer;

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/proposals/${proposal._id || proposal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || "Failed to accept proposal");
        setIsSubmitting(false);
        setIsAcceptOpen(false);
        return;
      }
      
      toast.success("Proposal accepted! Redirecting to contract...");
      
      if (data.data?.contract?._id) {
        router.push(`/contracts/${data.data.contract._id}`);
      } else if (data.data?.contract?.id) {
        router.push(`/contracts/${data.data.contract.id}`);
      } else {
        router.push("/contracts");
      }
      
    } catch (error) {
      toast.error("An unexpected error occurred");
      setIsSubmitting(false);
      setIsAcceptOpen(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/proposals/${proposal._id || proposal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "rejected", 
          clientNote: clientNote.trim() || null 
        }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || "Failed to reject proposal");
      } else {
        toast.success("Proposal rejected");
        setIsRejectOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
      case "accepted":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Accepted</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200">Rejected</span>;
      case "withdrawn":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200">Withdrawn</span>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-card rounded-2xl border p-6 flex flex-col md:flex-row gap-6 shadow-sm">
        
        {/* Freelancer Identity Column */}
        <div className="md:w-64 shrink-0 flex flex-col items-center text-center space-y-3 p-4 bg-muted/30 rounded-xl border">
          <Avatar className="w-20 h-20 border-2">
            <AvatarImage src={freelancer?.image || ""} />
            <AvatarFallback><UserCircle className="w-12 h-12 text-muted-foreground" /></AvatarFallback>
          </Avatar>
          
          <div>
            <Link href={`/freelancers/${freelancer?._id || freelancer?.id}`} className="font-bold text-lg hover:underline decoration-brand">
              {freelancer?.name || "Unknown"}
            </Link>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {freelancer?.headline || "Freelancer"}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
            {freelancer?.averageRating !== undefined && (
              <RatingDisplay rating={freelancer.averageRating} count={freelancer.reviewCount || 0} />
            )}
            <span className="px-2 py-1 bg-muted rounded-md text-muted-foreground">
              {freelancer?.location || "Remote"}
            </span>
          </div>
        </div>

        {/* Proposal Details Column */}
        <div className="flex-1 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div className="flex gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <DollarSign className="w-4 h-4" /> Proposed Rate
                </div>
                <div className="font-bold text-xl">${proposal.proposedRate}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4" /> Est. Timeline
                </div>
                <div className="font-semibold text-foreground">{proposal.timeline.replace(/_/g, " ")}</div>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
              </span>
              {getStatusBadge(proposal.status)}
            </div>
          </div>
          
          <div className="prose dark:prose-invert max-w-none text-sm text-muted-foreground mb-6 bg-muted/20 p-4 rounded-xl border border-dashed">
            {proposal.message.split("\n").map((para: string, i: number) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="mt-auto pt-4 flex gap-3 border-t">
            {proposal.status === "pending" && projectStatus === "open" ? (
              <>
                <Button 
                  onClick={() => setIsAcceptOpen(true)}
                  className="bg-brand hover:bg-brand/90 text-primary-foreground font-semibold px-8"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Accept & Hire
                </Button>
                <Button 
                  onClick={() => setIsRejectOpen(true)}
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <XCircle className="w-4 h-4 mr-2" /> Decline
                </Button>
                <MessageButton 
                  participantId={freelancer?._id || freelancer?.id}
                  projectId={proposal.projectId || proposal.project?._id || proposal.project}
                  variant="outline"
                />
              </>
            ) : proposal.status === "pending" && projectStatus !== "open" ? (
              <p className="text-sm text-amber-600 font-medium">
                This project is no longer accepting proposals.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                This proposal is {proposal.status}.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Accept Dialog */}
      <Dialog open={isAcceptOpen} onOpenChange={setIsAcceptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hire {freelancer?.name || "Freelancer"}?</DialogTitle>
            <DialogDescription className="pt-2 text-base text-foreground/80">
              You are about to accept this proposal for <span className="font-bold text-foreground">${proposal.proposedRate}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 text-amber-800 dark:text-amber-300 p-4 rounded-lg text-sm mb-2">
            <strong>Note:</strong> Accepting this proposal will immediately create a contract, move your project to 'In Progress', and automatically reject all other pending proposals for this project.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsAcceptOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAccept} disabled={isSubmitting} className="bg-brand hover:bg-brand/90">
              {isSubmitting ? "Processing..." : "Confirm & Hire"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Proposal</DialogTitle>
            <DialogDescription>
              You are declining the proposal from {freelancer?.name || "Freelancer"}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <label className="text-sm font-medium text-foreground">
              Reason for declining (Optional)
            </label>
            <Textarea 
              placeholder="Give the freelancer some constructive feedback..."
              value={clientNote}
              onChange={(e) => setClientNote(e.target.value)}
              className="resize-none"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              This will be shared with the freelancer in their rejection notification.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsRejectOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleReject} disabled={isSubmitting} variant="destructive">
              {isSubmitting ? "Processing..." : "Decline Proposal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
