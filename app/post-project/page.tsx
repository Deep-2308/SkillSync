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
import { Upload } from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useToast } from "@/hooks/use-toast"

const RATE_MAP: Record<string, number> = {
  junior: 35,
  mid: 65,
  senior: 120,
}

export default function PostProjectPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    skills: "",
    duration: "20",
    expertiseLevel: "mid",
    email: "",
  })

  const estimatedRate = RATE_MAP[formData.expertiseLevel] || 65
  const estimatedBudget = estimatedRate * Number(formData.duration || 0)
  const platformFee = Math.round(estimatedBudget * 0.1)
  const total = estimatedBudget + platformFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || formData.title.length < 3) {
      toast({ title: "Title required", description: "Project title must be at least 3 characters.", variant: "destructive" })
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
          budget: total,
          duration: Number(formData.duration),
          expertiseLevel: formData.expertiseLevel,
          email: formData.email,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to post project")
      }

      toast({ title: "Project Posted!", description: "Your project is now live and visible to freelancers." })
      router.push("/hire-talent")
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

  const inputClass = "bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10 h-11"
  const labelClass = "font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground"

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1 */}
            <AnimatedSection animation="slideUp" delay={0}>
              <div className="mb-16">
                <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-3 block">Step 01</span>
                <h1 className="font-display text-3xl font-bold text-foreground tracking-tight mb-2">
                  Project Details
                </h1>
                <p className="font-serif text-muted-foreground italic mb-8">
                  Describe your project. The more detail you provide, the better our AI can match you with freelancers.
                </p>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className={labelClass}>Project Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Build a React Dashboard with Auth"
                      className={inputClass}
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className={labelClass}>Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project requirements, features you need, tech preferences..."
                      className="bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10 min-h-[120px] resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category" className={labelClass}>Category</Label>
                      <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })} disabled={loading}>
                        <SelectTrigger className={inputClass}><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="web-development">Web Development</SelectItem>
                          <SelectItem value="mobile-app">Mobile App</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="data-science">Data Science</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skills" className={labelClass}>Required Skills <span className="normal-case">(comma-separated)</span></Label>
                      <Input
                        id="skills"
                        placeholder="React, Node.js, MongoDB"
                        className={inputClass}
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="border border-border rounded-lg bg-card p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <Upload className="h-7 w-7 mb-3 text-primary/60" />
                    <span className="font-mono text-[11px] tracking-wider uppercase text-foreground">Upload brief / files</span>
                    <span className="font-serif text-xs text-muted-foreground italic mt-1">Coming soon</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Step 2 */}
            <AnimatedSection animation="slideUp" delay={100}>
              <div className="mb-16">
                <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-3 block">Step 02</span>
                <h2 className="font-display text-3xl font-bold text-foreground tracking-tight mb-2">
                  Budget & Timeline
                </h2>
                <p className="font-serif text-muted-foreground italic mb-8">
                  Adjust these fields to refine your scope and see the estimated cost.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-2">
                    <Label className={labelClass}>Project Duration (Days)</Label>
                    <Input
                      type="number"
                      min="1"
                      className={inputClass}
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>Expertise Level</Label>
                    <Select value={formData.expertiseLevel} onValueChange={(v) => setFormData({ ...formData, expertiseLevel: v })} disabled={loading}>
                      <SelectTrigger className={inputClass}><SelectValue placeholder="Select level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior (1-3 years) — ~$35/day</SelectItem>
                        <SelectItem value="mid">Mid-Level (3-7 years) — ~$65/day</SelectItem>
                        <SelectItem value="senior">Senior (7+ years) — ~$120/day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pricing Card */}
                <div className="border border-border rounded-lg bg-card p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="font-bold text-lg">Pricing Estimate</h3>
                    <span className="font-mono text-[10px] tracking-wider uppercase text-primary border border-primary/20 px-2 py-0.5 rounded bg-primary/5">
                      Live
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between border border-border/50 rounded-lg bg-muted/50 p-4">
                        <span className="font-mono text-[10px] tracking-wider uppercase text-primary/70">Base Cost</span>
                        <span className="stat-number text-sm font-medium text-foreground">${estimatedBudget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border border-border/50 rounded-lg bg-muted/50 p-4">
                        <span className="font-mono text-[10px] tracking-wider uppercase text-primary/70">Platform Fee (10%)</span>
                        <span className="stat-number text-sm font-medium text-foreground">${platformFee.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="border border-primary/20 rounded-lg bg-primary/5 p-6 flex flex-col items-center justify-center">
                      <span className="font-mono text-[10px] tracking-wider uppercase text-primary/70 mb-2">Total Estimated</span>
                      <span className="stat-number text-5xl font-bold text-primary">${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Step 3 */}
            <AnimatedSection animation="slideUp" delay={200}>
              <div className="mb-12">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label className={labelClass}>Contact Email <span className="normal-case">(optional)</span></Label>
                    <Input
                      placeholder="Your email for project updates"
                      className={inputClass}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="btn-glow h-11 px-10 tracking-wide self-end" disabled={loading}>
                    {loading ? "Posting..." : "Post Project"}
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          </form>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
