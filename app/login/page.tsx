"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(email, password)

    if (result.error) {
      toast({
        title: "Login Failed",
        description: result.error,
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    toast({
      title: "Welcome back!",
      description: "You've successfully logged in.",
    })

    router.push("/hire-talent")
    setLoading(false)
  }

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8 min-h-[80vh]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-3 block">Welcome Back</span>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2 tracking-tight">Sign In</h1>
            <p className="font-serif text-muted-foreground italic text-sm">Access your SkillSync account</p>
          </div>

          <Card className="card-shimmer">
            <CardContent className="pt-8 pb-6 px-6 space-y-6">
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Email</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input id="remember" type="checkbox" className="h-3.5 w-3.5 rounded border-border bg-muted text-primary focus:ring-primary" />
                    <Label htmlFor="remember" className="text-xs text-muted-foreground">Remember me</Label>
                  </div>
                  <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 font-mono">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" className="w-full btn-glow h-11 tracking-wide" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><Separator /></div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full bg-transparent border-border hover:border-primary/30 hover:bg-primary/5 text-sm"
                onClick={handleGoogleLogin}
                type="button"
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>

              <div className="text-center">
                <span className="font-serif text-sm text-muted-foreground">Don&apos;t have an account? </span>
                <Link href="/signup" className="text-sm text-primary hover:text-primary/80 font-medium">Sign up</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
