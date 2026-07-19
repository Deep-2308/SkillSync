"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, ShieldAlert, Package, Check, RefreshCw, Star } from "lucide-react";
import { toast } from "sonner";
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
import { CheckoutForm } from "@/components/payments/CheckoutForm";
import { StripeProvider } from "@/components/payments/StripeProvider";
import { cn } from "@/lib/utils";
import { MessageButton } from "@/components/messages/MessageButton";
import { RatingDisplay } from "@/components/shared/RatingDisplay";

type ContractWorkspaceProps = {
  contract: any;
  currentUserId: string;
  myReview?: any;
  theirReview?: any;
};

export function ContractWorkspaceClient({ contract, currentUserId, myReview, theirReview }: ContractWorkspaceProps) {
  const router = useRouter();
  
  const isClient = contract.clientId._id === currentUserId || contract.clientId.id === currentUserId || contract.clientId === currentUserId;
  const isFreelancer = !isClient;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);

  // Review state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const submitReview = async () => {
    if (rating < 1 || comment.length < 10) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: contract.id || contract._id,
          targetId: isClient ? (contract.freelancerId._id || contract.freelancerId.id || contract.freelancerId) : (contract.clientId._id || contract.clientId.id || contract.clientId),
          rating,
          comment
        })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit review");
      } else {
        toast.success("Review submitted!");
        router.refresh();
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const updateStatus = async (status: string, reason?: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id || contract._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, disputeReason: reason }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || `Failed to mark as ${status}`);
      } else {
        toast.success(`Contract ${status}!`);
        setIsDisputeOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualRefresh = () => {
    router.refresh();
  };

  const currentStep = () => {
    if (contract.status === "completed") return 4;
    if (contract.status === "delivered") return 3;
    if (contract.paymentStatus === "paid") return 2;
    return 1;
  };
  
  const step = currentStep();

  return (
    <div className="space-y-8">
      {/* Visual Timeline */}
      <div className="bg-card rounded-2xl border p-6 sm:p-8">
        <h2 className="text-lg font-bold text-foreground mb-8">Contract Progress</h2>
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 rounded-full hidden sm:block"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-brand -translate-y-1/2 rounded-full hidden sm:block transition-all duration-500"
            style={{ width: `${(step - 1) * 33.33}%` }}
          ></div>
          
          <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-6 sm:gap-0">
            {/* Step 1: Created */}
            <div className="flex sm:flex-col items-center gap-4 sm:gap-2 text-left sm:text-center w-full sm:w-1/4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 font-bold transition-colors",
                step >= 1 ? "bg-brand text-primary-foreground border-brand" : "bg-card text-muted-foreground border-muted"
              )}>
                {step > 1 ? <Check className="w-5 h-5" /> : "1"}
              </div>
              <div>
                <p className={cn("font-medium", step >= 1 ? "text-foreground" : "text-muted-foreground")}>Created</p>
                <p className="text-xs text-muted-foreground sm:max-w-xs mx-auto mt-0.5">Agreed terms</p>
              </div>
            </div>

            {/* Step 2: Funded */}
            <div className="flex sm:flex-col items-center gap-4 sm:gap-2 text-left sm:text-center w-full sm:w-1/4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 font-bold transition-colors",
                step >= 2 ? "bg-brand text-primary-foreground border-brand" : "bg-card text-muted-foreground border-muted"
              )}>
                {step > 2 ? <Check className="w-5 h-5" /> : "2"}
              </div>
              <div>
                <p className={cn("font-medium", step >= 2 ? "text-foreground" : "text-muted-foreground")}>Funded</p>
                <p className="text-xs text-muted-foreground sm:max-w-xs mx-auto mt-0.5">Escrow secured</p>
              </div>
            </div>

            {/* Step 3: Delivered */}
            <div className="flex sm:flex-col items-center gap-4 sm:gap-2 text-left sm:text-center w-full sm:w-1/4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 font-bold transition-colors",
                step >= 3 ? "bg-brand text-primary-foreground border-brand" : "bg-card text-muted-foreground border-muted"
              )}>
                {step > 3 ? <Check className="w-5 h-5" /> : "3"}
              </div>
              <div>
                <p className={cn("font-medium", step >= 3 ? "text-foreground" : "text-muted-foreground")}>Delivered</p>
                <p className="text-xs text-muted-foreground sm:max-w-xs mx-auto mt-0.5">Work submitted</p>
              </div>
            </div>

            {/* Step 4: Completed */}
            <div className="flex sm:flex-col items-center gap-4 sm:gap-2 text-left sm:text-center w-full sm:w-1/4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 font-bold transition-colors",
                step >= 4 ? "bg-brand text-primary-foreground border-brand" : "bg-card text-muted-foreground border-muted"
              )}>
                4
              </div>
              <div>
                <p className={cn("font-medium", step >= 4 ? "text-foreground" : "text-muted-foreground")}>Completed</p>
                <p className="text-xs text-muted-foreground sm:max-w-xs mx-auto mt-0.5">Funds released</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Panel */}
      <div className="bg-card rounded-2xl border p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-lg font-bold text-foreground">Action Center</h2>
          <div className="flex items-center gap-2">
            <MessageButton 
              participantId={isClient ? (contract.freelancerId._id || contract.freelancerId.id || contract.freelancerId) : (contract.clientId._id || contract.clientId.id || contract.clientId)}
              contractId={contract.id || contract._id}
              projectId={contract.projectId?._id || contract.projectId?.id || contract.projectId}
              variant="outline"
              size="sm"
            >
              Message {isClient ? "Freelancer" : "Client"}
            </MessageButton>
            <Button variant="ghost" size="sm" onClick={handleManualRefresh} className="text-muted-foreground">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
          </div>
        </div>
        
        {contract.status === "cancelled" && (
          <div className="p-4 bg-slate-50 text-slate-700 rounded-xl border border-slate-200">
            This contract was cancelled. No further actions can be taken.
          </div>
        )}

        {contract.status === "disputed" && (
          <div className="p-6 bg-red-50 rounded-xl border border-red-200">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-800 text-lg">Contract is Disputed</h3>
                <p className="text-red-700 mt-1 mb-4">
                  All work and payments are frozen until an admin reviews the dispute.
                </p>
                <div className="bg-white/60 p-4 rounded-lg border border-red-100">
                  <p className="text-sm font-semibold text-red-900 mb-1">Dispute Reason:</p>
                  <p className="text-sm text-red-800">{contract.disputeReason}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Client Flow */}
        {isClient && contract.status === "active" && contract.paymentStatus === "pending" && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 mb-6">
              <h3 className="font-bold mb-1">Fund this contract</h3>
              <p className="text-sm">
                Before work can begin, you must fund the escrow. The freelancer will not be paid until you approve the delivered work.
              </p>
            </div>
            <StripeProvider>
              <CheckoutForm contractId={contract.id || contract._id} amount={contract.agreedRate} />
            </StripeProvider>
          </div>
        )}

        {isClient && contract.status === "active" && contract.paymentStatus === "paid" && (
          <div className="p-8 text-center bg-muted/30 rounded-xl border border-dashed">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-bold text-lg mb-2">Waiting for delivery</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You have funded the contract. The freelancer is currently working on your project and will submit the work here when it's ready.
            </p>
          </div>
        )}

        {isClient && contract.status === "delivered" && (
          <div className="space-y-6">
            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-emerald-800 text-lg">Work Delivered</h3>
                  <p className="text-emerald-700 mt-1 text-sm">
                    The freelancer has submitted the work. Please review it carefully. If everything looks good, you can mark the contract as completed, which will release the funds to the freelancer.
                  </p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => updateStatus("completed")}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-6 h-auto text-lg"
            >
              Approve & Complete Contract
            </Button>
          </div>
        )}

        {/* Freelancer Flow */}
        {isFreelancer && contract.status === "active" && contract.paymentStatus === "pending" && (
          <div className="p-8 text-center bg-muted/30 rounded-xl border border-dashed">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Waiting for funding</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              The client has not yet funded the escrow for this contract. <strong>Do not begin work</strong> until you see the funds are secured.
            </p>
          </div>
        )}

        {isFreelancer && contract.status === "active" && contract.paymentStatus === "paid" && (
          <div className="space-y-6">
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="font-bold text-blue-800 text-lg mb-1">Contract is Funded</h3>
              <p className="text-blue-700 text-sm">
                The funds are safely in escrow. You may begin working. Once you have finished the work according to the timeline, submit it to the client and click the button below.
              </p>
            </div>
            <Button 
              onClick={() => updateStatus("delivered")}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-brand hover:bg-brand/90 text-white font-semibold px-8 py-6 h-auto text-lg"
            >
              Mark Work as Delivered
            </Button>
          </div>
        )}

        {isFreelancer && contract.status === "delivered" && (
          <div className="p-8 text-center bg-muted/30 rounded-xl border border-dashed">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Work Delivered</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You have marked this contract as delivered. Waiting for the client to review and approve to release the funds.
            </p>
          </div>
        )}

        {contract.status === "completed" && (
          <div className="space-y-6">
            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <h3 className="font-bold text-emerald-800 text-xl mb-2">Contract Completed!</h3>
              <p className="text-emerald-700 max-w-md mx-auto">
                This contract was successfully completed. Funds have been released to the freelancer.
              </p>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold text-foreground mb-4">Reviews</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* My Review */}
                <div className="bg-muted/30 rounded-xl border p-5">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Your Review</h4>
                  {myReview ? (
                    <div>
                      <RatingDisplay rating={myReview.rating} showCount={false} className="mb-3" />
                      <p className="text-sm text-foreground">{myReview.comment}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="flex gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star
                                className={cn(
                                  "w-6 h-6 transition-colors",
                                  (hoverRating || rating) >= star
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-muted-foreground/30"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                        <Textarea 
                          placeholder={`Leave a review for ${isClient ? 'the freelancer' : 'the client'}...`}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="text-sm resize-none mt-3"
                          rows={3}
                        />
                      </div>
                      <Button 
                        onClick={submitReview} 
                        disabled={isSubmittingReview || rating === 0 || comment.length < 10}
                        className="w-full"
                      >
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Their Review */}
                <div className="bg-muted/30 rounded-xl border p-5">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">
                    {isClient ? "Freelancer's Review" : "Client's Review"}
                  </h4>
                  {theirReview ? (
                    <div>
                      <RatingDisplay rating={theirReview.rating} showCount={false} className="mb-3" />
                      <p className="text-sm text-foreground">{theirReview.comment}</p>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-6 text-muted-foreground">
                      <Star className="w-8 h-8 mb-3 opacity-20" />
                      <p className="text-sm">Awaiting their review.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Dispute Button */}
        {contract.status !== "cancelled" && contract.status !== "disputed" && contract.status !== "completed" && (
          <div className="mt-12 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Having issues with this contract? You can raise a dispute to freeze the contract and request mediation.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setIsDisputeOpen(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <ShieldAlert className="w-4 h-4 mr-2" />
              Raise Dispute
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isDisputeOpen} onOpenChange={setIsDisputeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise a Dispute</DialogTitle>
            <DialogDescription>
              This will freeze all actions on this contract until a platform admin resolves the issue. Please provide a detailed reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for Dispute</label>
              <Textarea 
                placeholder="Explain the issue in detail..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisputeOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={() => updateStatus("disputed", disputeReason)} 
              disabled={isSubmitting || disputeReason.trim().length < 5} 
              variant="destructive"
            >
              {isSubmitting ? "Submitting..." : "Submit Dispute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
