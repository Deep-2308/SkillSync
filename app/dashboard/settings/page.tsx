"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AnimatedSection } from "@/components/animated-section"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Trash2, PauseCircle, Shield, CheckCircle } from "lucide-react"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [deactivateConfirm, setDeactivateConfirm] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [loading, setLoading] = useState<string | null>(null)

  const handleDeactivate = async () => {
    if (deactivateConfirm !== "DEACTIVATE") {
      toast({ title: "Type DEACTIVATE to confirm", variant: "destructive" })
      return
    }
    setLoading("deactivate")
    try {
      const res = await fetch("/api/auth/deactivate", { method: "POST" })
      if (res.ok) {
        toast({ title: "Account deactivated", description: "You have been logged out." })
        await logout()
        router.push("/")
      } else {
        const data = await res.json()
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to deactivate.", variant: "destructive" })
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    if (deleteConfirm !== "DELETE MY ACCOUNT") {
      toast({ title: "Type DELETE MY ACCOUNT to confirm", variant: "destructive" })
      return
    }
    setLoading("delete")
    try {
      const res = await fetch("/api/auth/deactivate", { method: "DELETE" })
      if (res.ok) {
        toast({ title: "Account deleted", description: "All your data has been permanently removed." })
        await logout()
        router.push("/")
      } else {
        const data = await res.json()
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-8">
      <AnimatedSection animation="slideUp" delay={0}>
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-1 block">Settings</span>
        <h1 className="font-display text-2xl font-bold tracking-tight">Account Settings</h1>
      </AnimatedSection>

      {/* Account Status */}
      <AnimatedSection animation="slideUp" delay={80}>
        <Card className="card-shimmer">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60">Account Status</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Email</span>
                <span className="font-mono text-xs">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Email Verified</span>
                {user?.isVerified ? (
                  <span className="flex items-center gap-1 text-accent text-xs font-mono">
                    <CheckCircle className="h-3 w-3" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-primary text-xs font-mono">
                    <AlertTriangle className="h-3 w-3" /> Not Verified
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Role</span>
                <span className="font-mono text-xs capitalize">{user?.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Deactivate Account */}
      <AnimatedSection animation="slideUp" delay={160}>
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <PauseCircle className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-sm">Deactivate Account</h2>
            </div>
            <p className="text-xs text-muted-foreground font-serif italic mb-4">
              Temporarily disable your account. Your profile and data will be hidden but preserved. You can contact support to reactivate.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder='Type "DEACTIVATE" to confirm'
                className="bg-muted border-border text-xs h-9"
                value={deactivateConfirm}
                onChange={(e) => setDeactivateConfirm(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 border-primary/30 text-primary hover:bg-primary/10"
                onClick={handleDeactivate}
                disabled={loading === "deactivate" || deactivateConfirm !== "DEACTIVATE"}
              >
                <PauseCircle className="mr-1 h-3 w-3" />
                {loading === "deactivate" ? "..." : "Deactivate"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Delete Account */}
      <AnimatedSection animation="slideUp" delay={240}>
        <Card className="border-destructive/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <h2 className="font-bold text-sm text-destructive">Delete Account Permanently</h2>
            </div>
            <p className="text-xs text-muted-foreground font-serif italic mb-4">
              This action is irreversible. All your data, projects, proposals, messages, and portfolio will be permanently deleted.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder='Type "DELETE MY ACCOUNT" to confirm'
                className="bg-muted border-border text-xs h-9"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
              />
              <Button
                variant="destructive"
                size="sm"
                className="shrink-0"
                onClick={handleDelete}
                disabled={loading === "delete" || deleteConfirm !== "DELETE MY ACCOUNT"}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                {loading === "delete" ? "..." : "Delete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  )
}
