"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/context/AuthContext"
import { AlertCircle } from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"

export default function ShareSkillPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    experience: "",
    rate: "",
    description: "",
  })

  // Redirect non-experts
  if (user && user.role !== "expert") {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="max-w-md mx-auto py-24 px-4 text-center">
            <div className="space-y-6">
              <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <AlertCircle className="h-7 w-7 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold">Access Restricted</h1>
              <p className="font-serif text-muted-foreground italic">
                Only Experts can share skills. You are currently logged in as a Learner.
              </p>
              <Button onClick={() => router.push("/hire-talent")} className="btn-glow">
                Browse Talent
              </Button>
            </div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/share-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit skill")
      }

      toast({
        title: "Skill Shared Successfully!",
        description: "Your service is now visible to learners.",
      })

      router.push("/hire-talent")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10"
  const labelClass = "font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground"

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="slideUp" delay={0}>
            <div className="mb-10 text-center">
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-3 block">Expert</span>
              <h1 className="font-display text-3xl font-bold text-foreground tracking-tight mb-2">Share Your Expertise</h1>
              <p className="font-serif text-muted-foreground italic text-sm">
                Create a listing to offer your skills to the SkillSync community.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fadeIn" delay={100}>
            <Card className="card-shimmer">
              <CardHeader>
                <CardTitle>Skill Details</CardTitle>
                <CardDescription className="font-serif italic">
                  Provide clear and accurate information about what you offer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className={labelClass}>Skill Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Senior React Developer, AI Consultant"
                      className={inputClass}
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category" className={labelClass}>Category</Label>
                      <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                        <SelectTrigger className={inputClass}><SelectValue placeholder="Select Category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="ai">AI / Machine Learning</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rate" className={labelClass}>Hourly Rate ($)</Label>
                      <Input
                        id="rate"
                        type="number"
                        placeholder="50"
                        className={inputClass}
                        value={formData.rate}
                        onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience" className={labelClass}>Years of Experience</Label>
                    <Select value={formData.experience} onValueChange={(val) => setFormData({ ...formData, experience: val })}>
                      <SelectTrigger className={inputClass}><SelectValue placeholder="Select Level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior (1-3 years)</SelectItem>
                        <SelectItem value="mid">Mid-Level (3-7 years)</SelectItem>
                        <SelectItem value="senior">Senior (7+ years)</SelectItem>
                        <SelectItem value="expert">Expert (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className={labelClass}>Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your service, what you deliver, and your process..."
                      className={`min-h-[140px] resize-none ${inputClass}`}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" className="w-full btn-glow h-11 tracking-wide" disabled={loading}>
                    {loading ? "Publishing..." : "Publish Skill"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </AnimatedSection>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
