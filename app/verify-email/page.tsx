"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const status = searchParams.get("status")

  const config = {
    success: {
      icon: <CheckCircle className="h-10 w-10 text-accent" />,
      title: "Email Verified!",
      description: "Your email has been verified successfully. You now have full access to SkillSync.",
      action: <Link href="/login"><Button className="btn-glow">Go to Login</Button></Link>,
    },
    expired: {
      icon: <AlertTriangle className="h-10 w-10 text-primary" />,
      title: "Link Expired",
      description: "This verification link has expired. Please request a new one from your dashboard.",
      action: <Link href="/login"><Button variant="outline">Go to Login</Button></Link>,
    },
    invalid: {
      icon: <XCircle className="h-10 w-10 text-destructive" />,
      title: "Invalid Link",
      description: "This verification link is invalid. Please check your email for the correct link.",
      action: <Link href="/login"><Button variant="outline">Go to Login</Button></Link>,
    },
    error: {
      icon: <XCircle className="h-10 w-10 text-destructive" />,
      title: "Something Went Wrong",
      description: "An error occurred during verification. Please try again later.",
      action: <Link href="/login"><Button variant="outline">Go to Login</Button></Link>,
    },
  }

  const current = config[status as keyof typeof config] || config.invalid

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">{current.icon}</div>
      <h2 className="font-display text-2xl font-bold">{current.title}</h2>
      <p className="font-serif text-sm text-muted-foreground italic max-w-sm mx-auto">{current.description}</p>
      {current.action}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="flex items-center justify-center px-4 py-16 min-h-[80vh]">
        <Card className="card-shimmer w-full max-w-md">
          <CardContent className="pt-10 pb-8 px-8">
            <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading...</div>}>
              <VerifyEmailContent />
            </Suspense>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
