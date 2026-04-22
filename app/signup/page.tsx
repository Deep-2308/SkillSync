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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User, Building } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthContext"
import type { UserRole } from "@/context/AuthContext"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { signup } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "" as UserRole | "",
    companyName: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  })

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure both passwords are the same.", variant: "destructive" })
      return
    }
    if (formData.password.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters.", variant: "destructive" })
      return
    }
    if (!formData.termsAccepted) {
      toast({ title: "Accept terms", description: "Please accept the Terms of Service to continue.", variant: "destructive" })
      return
    }
    if (!formData.role) {
      toast({ title: "Select a role", description: "Please select whether you are a Learner or an Expert.", variant: "destructive" })
      return
    }

    setLoading(true)

    const result = await signup({
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      password: formData.password,
      role: formData.role as UserRole,
    })

    if (result.error) {
      toast({
        title: "Signup Failed",
        description: result.error,
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    toast({ title: "Account created!", description: "Welcome to SkillSync!" })
    router.push("/hire-talent")
    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    toast({ title: "Coming Soon", description: "Google signup will be available soon. Please use email/password for now." })
  }

  const inputClass = "bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10"
  const labelClass = "font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground"

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-3 block">Join Us</span>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2 tracking-tight">Create Account</h1>
            <p className="font-serif text-muted-foreground italic text-sm">Start connecting with top talent</p>
          </div>

          <Card className="card-shimmer">
            <CardContent className="pt-8 pb-6 px-6 space-y-6">
              <form className="space-y-4" onSubmit={handleSignup}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className={labelClass}>First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="firstName" placeholder="John" className={`pl-10 ${inputClass}`} value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required disabled={loading} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className={labelClass}>Last Name</Label>
                    <Input id="lastName" placeholder="Doe" className={inputClass} value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required disabled={loading} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className={labelClass}>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="john@example.com" className={`pl-10 ${inputClass}`} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={loading} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className={labelClass}>I want to...</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })} disabled={loading}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select your role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="learner">Hire Talent (Learner)</SelectItem>
                      <SelectItem value="expert">Work as Freelancer (Expert)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className={labelClass}>Company <span className="normal-case">(optional)</span></Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="company" placeholder="Your company" className={`pl-10 ${inputClass}`} value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} disabled={loading} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className={labelClass}>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" className={`pl-10 pr-10 ${inputClass}`} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required disabled={loading} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className={labelClass}>Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" className={`pl-10 pr-10 ${inputClass}`} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required disabled={loading} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <input id="terms" type="checkbox" className="mt-1 h-3.5 w-3.5 rounded border-border bg-muted text-primary focus:ring-primary" checked={formData.termsAccepted} onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })} required disabled={loading} />
                  <Label htmlFor="terms" className="text-xs leading-5 text-muted-foreground font-serif">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:text-primary/80">Terms of Service</Link>{" "}and{" "}
                    <Link href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</Link>
                  </Label>
                </div>

                <Button type="submit" className="w-full btn-glow h-11 tracking-wide" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
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
                onClick={handleGoogleSignup}
                type="button"
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                Continue with Google
              </Button>

              <div className="text-center">
                <span className="font-serif text-sm text-muted-foreground">Already have an account? </span>
                <Link href="/login" className="text-sm text-primary hover:text-primary/80 font-medium">Sign in</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
