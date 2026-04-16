"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [devToken, setDevToken] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset link")
      }

      setSent(true)

      // In dev mode, show the reset token for testing
      if (data.devToken) {
        setDevToken(data.devToken)
      }

      toast({
        title: "Check your email",
        description: "If an account exists, a password reset link has been sent.",
      })
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8 min-h-[80vh]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-3 block">
              Account Recovery
            </span>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2 tracking-tight">
              Reset Password
            </h1>
            <p className="font-serif text-muted-foreground italic text-sm">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          <Card className="card-shimmer">
            <CardContent className="pt-8 pb-6 px-6">
              {sent ? (
                <div className="text-center space-y-6">
                  <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                    <CheckCircle className="h-7 w-7 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground mb-2">Check Your Email</h2>
                    <p className="font-serif text-sm text-muted-foreground italic">
                      If an account with <span className="text-foreground">{email}</span> exists,
                      you&apos;ll receive a password reset link shortly.
                    </p>
                  </div>

                  {devToken && (
                    <div className="border border-primary/20 rounded-lg bg-primary/5 p-4 text-left">
                      <span className="font-mono text-[10px] tracking-wider uppercase text-primary/70 block mb-2">
                        DEV MODE — Reset Link
                      </span>
                      <a
                        href={`/reset-password?token=${devToken}`}
                        className="font-mono text-xs text-primary break-all hover:underline"
                      >
                        /reset-password?token={devToken.slice(0, 20)}...
                      </a>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-border hover:border-primary/30"
                      onClick={() => { setSent(false); setDevToken("") }}
                    >
                      Try another email
                    </Button>
                    <Link href="/login">
                      <Button variant="ghost" className="w-full text-muted-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full btn-glow h-11 tracking-wide" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>

                  <div className="text-center">
                    <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                      <ArrowLeft className="h-3 w-3" /> Back to Login
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
