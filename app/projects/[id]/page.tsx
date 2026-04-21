"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatedSection } from "@/components/animated-section"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import {
  Clock, DollarSign, Zap, MapPin, ArrowLeft, Send, CheckCircle, XCircle,
  Loader2, Star, Users
} from "lucide-react"
import Link from "next/link"

interface ProjectDetail {
  _id: string
  title: string
  description: string
  category: string
  skills: string[]
  budget: number
  duration: number
  expertiseLevel: string
  status: string
  clientId: { _id: string; name: string; username?: string; image?: string }
  createdAt: string
}

interface ProposalItem {
  _id: string
  coverLetter: string
  proposedBudget: number
  timeline: number
  status: string
  createdAt: string
  freelancerId: {
    _id: string; name: string; image?: string; username?: string
    rating: number; reviewCount: number; skills?: string[]; hourlyRate?: number; location?: string
  }
}

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const { user } = useAuth()
  const { toast } = useToast()

  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [proposals, setProposals] = useState<ProposalItem[]>([])
  const [proposalCount, setProposalCount] = useState(0)
  const [hasProposed, setHasProposed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)

  const [form, setForm] = useState({
    coverLetter: "",
    proposedBudget: "",
    timeline: "",
  })

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`)
        const data = await res.json()
        if (data.project) {
          setProject(data.project)
          setProposalCount(data.proposalCount || 0)
          setHasProposed(data.hasProposed || false)
        }
      } catch {
        // handled
      } finally {
        setLoading(false)
      }
    }
    if (projectId) fetchProject()
  }, [projectId])

  // Fetch proposals if current user is the client
  useEffect(() => {
    const fetchProposals = async () => {
      if (!project || !user) return
      if (project.clientId._id !== user.id) return

      try {
        const res = await fetch(`/api/proposals?projectId=${projectId}`)
        const data = await res.json()
        if (data.proposals) setProposals(data.proposals)
      } catch {
        // handled
      }
    }
    fetchProposals()
  }, [project, user, projectId])

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          coverLetter: form.coverLetter,
          proposedBudget: Number(form.proposedBudget),
          timeline: Number(form.timeline),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit")

      setHasProposed(true)
      setProposalCount((c) => c + 1)
      toast({ title: "Proposal Sent!", description: "The client will review your proposal." })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit proposal",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleProposalAction = async (proposalId: string, status: "accepted" | "rejected") => {
    setActionId(proposalId)
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update")

      setProposals((prev) =>
        prev.map((p) => (p._id === proposalId ? { ...p, status } : status === "accepted" && p._id !== proposalId ? { ...p, status: "rejected" } : p))
      )

      if (status === "accepted") {
        setProject((prev) => prev ? { ...prev, status: "in-progress" } : prev)
        toast({ title: "Proposal Accepted!", description: "A conversation has been created. Check your Messages." })
      } else {
        toast({ title: "Proposal Rejected" })
      }
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed", variant: "destructive" })
    } finally {
      setActionId(null)
    }
  }

  const isOwner = user && project && project.clientId._id === user.id
  const labelClass = "font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground"
  const inputClass = "bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10 h-11"

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="text-center py-32 px-4">
          <h1 className="font-display text-3xl font-bold mb-4">Project Not Found</h1>
          <Link href="/hire-talent"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Browse Projects</Button></Link>
        </div>
        <Footer />
      </div>
    )
  }

  const postedDate = new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="slideUp" delay={0}>
          <Link href="/hire-talent" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-mono mb-6 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Back to Projects
          </Link>

          {/* Project Header */}
          <div className="rounded-lg border border-border/40 bg-card p-6 md:p-8 mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded border ${
                project.status === "open" ? "text-accent border-accent/20 bg-accent/5" :
                project.status === "in-progress" ? "text-primary border-primary/20 bg-primary/5" :
                "text-muted-foreground border-border bg-muted"
              }`}>
                {project.status}
              </span>
              {project.category && (
                <span className="font-mono text-[9px] tracking-wider uppercase text-muted-foreground border border-border px-2 py-0.5 rounded">
                  {project.category}
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-3">{project.title}</h1>

            {project.description && (
              <p className="font-serif text-sm text-muted-foreground leading-relaxed mb-6 max-w-3xl">{project.description}</p>
            )}

            <div className="flex flex-wrap gap-6 text-xs text-muted-foreground mb-6">
              <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-primary" /> Budget: <strong className="text-foreground">${project.budget.toLocaleString()}</strong></span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> Duration: <strong className="text-foreground">{project.duration} days</strong></span>
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Level: <strong className="text-foreground capitalize">{project.expertiseLevel}</strong></span>
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-primary" /> Proposals: <strong className="text-foreground">{proposalCount}</strong></span>
              <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Posted {postedDate}</span>
            </div>

            {project.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {project.skills.map((s) => (
                  <span key={s} className="font-mono text-[9px] tracking-wider uppercase text-primary/70 border border-primary/15 px-2 py-0.5 rounded bg-primary/5">{s}</span>
                ))}
              </div>
            )}

            {/* Client Info */}
            <div className="mt-6 pt-6 border-t border-border/40 flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={project.clientId.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">{project.clientId.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{project.clientId.name}</p>
                <p className="text-[10px] font-mono text-muted-foreground">Client</p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* If client: show proposals */}
            {isOwner && (
              <AnimatedSection animation="slideUp" delay={80}>
                <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-4">
                  Received Proposals ({proposals.length})
                </h2>

                {proposals.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-lg">
                    <p className="font-serif text-muted-foreground italic">No proposals yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((p) => (
                      <Card key={p._id} className="card-shimmer">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={p.freelancerId.image || ""} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">{p.freelancerId.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-bold">{p.freelancerId.name}</p>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                                  <Star className="h-3 w-3 text-primary fill-primary" /> {p.freelancerId.rating || 0}
                                  {p.freelancerId.location && <><MapPin className="h-3 w-3 ml-1" /> {p.freelancerId.location}</>}
                                </div>
                              </div>
                            </div>
                            <span className={`font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded border ${
                              p.status === "pending" ? "text-primary border-primary/20 bg-primary/5" :
                              p.status === "accepted" ? "text-accent border-accent/20 bg-accent/5" :
                              "text-destructive border-destructive/20 bg-destructive/5"
                            }`}>
                              {p.status}
                            </span>
                          </div>

                          <p className="font-serif text-sm text-muted-foreground mb-3 leading-relaxed">{p.coverLetter}</p>

                          <div className="flex gap-4 text-xs font-mono text-muted-foreground mb-4">
                            <span><DollarSign className="h-3 w-3 inline text-primary" /> ${p.proposedBudget.toLocaleString()}</span>
                            <span><Clock className="h-3 w-3 inline text-primary" /> {p.timeline} days</span>
                          </div>

                          {p.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="btn-glow text-xs"
                                onClick={() => handleProposalAction(p._id, "accepted")}
                                disabled={actionId === p._id}
                              >
                                {actionId === p._id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <CheckCircle className="mr-1 h-3 w-3" />}
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => handleProposalAction(p._id, "rejected")}
                                disabled={actionId === p._id}
                              >
                                <XCircle className="mr-1 h-3 w-3" /> Reject
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </AnimatedSection>
            )}

            {/* If freelancer: show proposal form or status */}
            {!isOwner && user && (
              <AnimatedSection animation="slideUp" delay={80}>
                {hasProposed ? (
                  <Card className="border-accent/20">
                    <CardContent className="p-6 text-center">
                      <CheckCircle className="h-8 w-8 text-accent mx-auto mb-3" />
                      <h2 className="font-bold text-lg mb-1">Proposal Submitted</h2>
                      <p className="font-serif text-sm text-muted-foreground italic">
                        Your proposal is under review. You&apos;ll be notified when the client responds.
                      </p>
                    </CardContent>
                  </Card>
                ) : project.status === "open" ? (
                  <Card className="card-shimmer">
                    <CardContent className="p-6">
                      <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-4">Submit a Proposal</h2>
                      <form onSubmit={handleSubmitProposal} className="space-y-4">
                        <div className="space-y-2">
                          <Label className={labelClass}>Cover Letter *</Label>
                          <Textarea
                            placeholder="Explain why you're the best fit for this project..."
                            className="bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10 min-h-[120px] resize-none"
                            value={form.coverLetter}
                            onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                            required
                            disabled={submitting}
                          />
                          <p className="text-[10px] font-mono text-muted-foreground">{form.coverLetter.length}/500 • Min 20 chars</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className={labelClass}>Your Budget (USD) *</Label>
                            <Input type="number" placeholder="e.g. 500" className={inputClass} value={form.proposedBudget} onChange={(e) => setForm({ ...form, proposedBudget: e.target.value })} required disabled={submitting} />
                          </div>
                          <div className="space-y-2">
                            <Label className={labelClass}>Timeline (Days) *</Label>
                            <Input type="number" placeholder="e.g. 14" className={inputClass} value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} required disabled={submitting} />
                          </div>
                        </div>
                        <Button type="submit" className="w-full btn-glow h-11" disabled={submitting}>
                          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                          {submitting ? "Submitting..." : "Submit Proposal"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-border/40">
                    <CardContent className="p-6 text-center">
                      <p className="font-serif text-muted-foreground italic">This project is no longer accepting proposals.</p>
                    </CardContent>
                  </Card>
                )}
              </AnimatedSection>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <AnimatedSection animation="slideUp" delay={160}>
              <Card className="card-shimmer">
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-mono text-[10px] tracking-[0.15em] uppercase text-primary/60">Project Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Budget</span><span className="font-bold stat-number">${project.budget.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-bold">{project.duration} days</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Level</span><span className="font-bold capitalize">{project.expertiseLevel}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Proposals</span><span className="font-bold">{proposalCount}</span></div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {!user && (
              <AnimatedSection animation="slideUp" delay={240}>
                <Card className="border-primary/20">
                  <CardContent className="p-5 text-center">
                    <p className="text-sm text-muted-foreground mb-3 font-serif">Sign in to submit a proposal</p>
                    <Link href="/login"><Button className="w-full btn-glow">Login</Button></Link>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
