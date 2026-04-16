"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Lock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Suspense } from "react"

function ResetPasswordForm() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="text-center space-y-6">
        <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertCircle className="h-7 w-7 text-destructive" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Invalid Reset Link</h2>
        <p className="font-serif text-sm text-muted-foreground italic">
          This password reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password">
          <Button className="btn-glow">Request New Link</Button>
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" })
      return
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Must be at least 6 characters.", variant: "destructive" })
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Reset failed")
      }

      setSuccess(true)
      toast({ title: "Password Reset!", description: "You can now log in with your new password." })

      setTimeout(() => router.push("/login"), 3000)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
          <CheckCircle className="h-7 w-7 text-accent" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Password Reset Successfully</h2>
        <p className="font-serif text-sm text-muted-foreground italic">
          Redirecting to login...
        </p>
      </div>
    )
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground">New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="password"
            placeholder="Min. 6 characters"
            className="pl-10 bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="password"
            placeholder="Confirm new password"
            className="pl-10 bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      </div>

      <Button type="submit" className="w-full btn-glow h-11 tracking-wide" disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8 min-h-[80vh]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-3 block">Security</span>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2 tracking-tight">New Password</h1>
            <p className="font-serif text-muted-foreground italic text-sm">Enter your new password below</p>
          </div>

          <Card className="card-shimmer">
            <CardContent className="pt-8 pb-6 px-6">
              <Suspense fallback={<div className="text-center py-8"><p className="text-muted-foreground">Loading...</p></div>}>
                <ResetPasswordForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
