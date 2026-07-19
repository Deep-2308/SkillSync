"use client";

import { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function VerifyEmailBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  if (dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      if (res.ok) {
        toast.success("Verification email sent!");
      } else {
        toast.error("Failed to send verification email. Please try again later.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-100 border-b border-amber-200 px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm font-medium text-amber-800">
            Please verify your email address to get full access to the platform.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 h-8"
            onClick={handleResend}
            disabled={sending}
          >
            {sending ? "Sending..." : "Resend Email"}
          </Button>
          <button 
            onClick={() => setDismissed(true)} 
            className="p-1 text-amber-600 hover:bg-amber-200 rounded-full transition-colors focus:outline-none"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
