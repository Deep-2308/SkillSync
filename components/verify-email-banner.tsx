"use client"

import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function VerifyEmailBanner() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [dismissed, setDismissed] = useState(false)
  const [resending, setResending] = useState(false)

  if (!isAuthenticated || !user || user.isVerified !== false || dismissed) {
    return null
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        toast({ title: "Verification email sent!", description: "Check your inbox." })
      } else {
        toast({ title: "Error", description: data.error || "Failed to resend.", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to resend verification email.", variant: "destructive" })
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="bg-primary/10 border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs text-foreground truncate">
            <span className="font-medium">Verify your email</span>
            <span className="text-muted-foreground hidden sm:inline"> to unlock all platform features.</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[10px] font-mono border-primary/30 hover:bg-primary/10"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? "Sending..." : "Resend Email"}
          </Button>
          <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
