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
  Clock, DollarSign, Zap, MapPin, Star, Send, Loader2, CheckCircle, XCircle, ArrowLeft, Users, Briefcase,
} from "lucide-react"
import Link from "next/link"

interface ProjectClient {
  _id: string
  name: string
  username?: string
  image?: string
}

interface ProjectData {
  _id: string
  title: string
  description: string
  category: string
  skills: string[]
  budget: number
  duration: number
  expertiseLevel: string
  clientId: ProjectClient
  status: string
  createdAt: string
}

interface ProposalData {
  _id: string
  freelancerId: {
    _id: string
    name: string
    username?: string
    image?: string
    rating: number
    reviewCount: number
    skills: string[]
    hourlyRate?: number
    location?: string
  }
  coverLetter: string
  proposedBudget: number
  timeline: number
  status: string
  createdAt: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const { user } = useAuth()
  const { toast } = useToast()

  const [project, setProject] = useState<ProjectData | null>(null)
  const [proposalCount, setProposalCount] = useState(0)
  const [proposals, setProposals] = useState<ProposalData[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [myProposal, setMyProposal] = useState<ProposalData | null>(null)

  const [form, setForm] = useState({
    coverLetter: "",
    proposedBudget: "",
    timeline: "",
  })

  const isOwner = user && project && project.clientId?._id === user.id

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`)
        const data = await res.json()
        if (data.project) {
          setProject(data.project)
          setProposalCount(data.proposalCount || 0)
        }

        // If owner, fetch proposals
        if (data.project) {
          const pRes = await fetch(`/api/proposals?projectId=${projectId}`)
          const pData = await pRes.json()
          if (pData.proposals) {
            setProposals(pData.proposals)
            // Check if current user already submitted
            if (user) {
              const mine = pData.proposals.find(
                (p: ProposalData) => p.freelancerId?._id === user.id
              )
              if (mine) setMyProposal(mine)
            }
          }
        }
      } catch {
        // handled
      } finally {
        setLoading(false)
      }
    }
    if (projectId) fetchProject()
  }, [projectId, user])

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
      if (!res.ok) throw new Error(data.error)

      toast({ title: "Proposal Submitted!", description: "The client will review your proposal." })
      setMyProposal(data.proposal)
      setProposalCount((c) => c + 1)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit",
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
      if (!res.ok) throw new Error(data.error)

      toast({ title: `Proposal ${status}!` })

      // Refresh proposals
      setProposals((prev) =>
        prev.map((p) =>
          p._id === proposalId
            ? { ...p, status }
            : status === "accepted" && p.status === "pending"
            ? { ...p, status: "rejected" }
            : p
        )
      )
      if (status === "accepted") {
        setProject((prev) => prev ? { ...prev, status: "in-progress" } : prev)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Action failed",
        variant: "destructive",
      })
    } finally {
      setActionId(null)
    }
  }

  const inputClass = "bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10 h-11"
  const labelClass = "font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground"

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link href="/hire-talent" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-8 font-mono transition-colors">
          <ArrowLeft className="h-3 w-3" /> Back to Projects
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatedSection animation="slideUp" delay={0}>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded border ${
                    project.status === "open"
                      ? "text-accent border-accent/20 bg-accent/5"
                      : "text-primary border-primary/20 bg-primary/5"
                  }`}>
                    {project.status}
                  </span>
                  {project.category && (
                    <span className="font-mono text-[9px] tracking-wider uppercase text-muted-foreground">{project.category}</span>
                  )}
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-4">{project.title}</h1>
                {project.description && (
                  <p className="font-serif text-muted-foreground leading-relaxed">{project.description}</p>
                )}
              </div>
            </AnimatedSection>

            {/* Skills */}
            {project.skills.length > 0 && (
              <AnimatedSection animation="slideUp" delay={80}>
                <Card className="card-shimmer">
                  <CardContent className="p-5">
                    <h2 className="font-mono text-[10px] tracking-[0.15em] uppercase text-primary/60 mb-3">Required Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((skill) => (
                        <span key={skill} className="font-mono text-[9px] tracking-wider uppercase text-primary/80 border border-primary/20 px-2.5 py-1 rounded bg-primary/5">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {/* Proposals Section (For project owner) */}
            {isOwner && (
              <AnimatedSection animation="slideUp" delay={160}>
                <div>
                  <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-5 flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" /> Proposals ({proposals.length})
                  </h2>

                  {proposals.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-lg">
                      <p className="font-serif text-muted-foreground italic">No proposals yet. Share your project to attract freelancers!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {proposals.map((proposal) => (
                        <Card key={proposal._id} className="card-shimmer">
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={proposal.freelancerId?.image} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-mono">
                                  {proposal.freelancerId?.name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-3 mb-1">
                                  <div>
                                    <h3 className="font-bold text-sm">{proposal.freelancerId?.name}</h3>
                                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-primary fill-primary" />{proposal.freelancerId?.rating || 0}</span>
                                      {proposal.freelancerId?.location && (
                                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{proposal.freelancerId.location}</span>
                                      )}
                                    </div>
                                  </div>
                                  <span className={`font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded border ${
                                    proposal.status === "pending" ? "text-primary border-primary/20 bg-primary/5" :
                                    proposal.status === "accepted" ? "text-accent border-accent/20 bg-accent/5" :
                                    "text-destructive border-destructive/20 bg-destructive/5"
                                  }`}>
                                    {proposal.status}
                                  </span>
                                </div>

                                <p className="text-xs text-muted-foreground font-serif my-3 leading-relaxed">{proposal.coverLetter}</p>

                                <div className="flex items-center gap-4 text-xs font-mono mb-3">
                                  <span className="flex items-center gap-1"><DollarSign className="h-3 w-3 text-accent" />${proposal.proposedBudget}</span>
                                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{proposal.timeline} days</span>
                                </div>

                                {proposal.status === "pending" && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      className="btn-glow text-xs h-8"
                                      onClick={() => handleProposalAction(proposal._id, "accepted")}
                                      disabled={actionId === proposal._id}
                                    >
                                      {actionId === proposal._id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <CheckCircle className="mr-1 h-3 w-3" />}
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs h-8 text-destructive hover:text-destructive"
                                      onClick={() => handleProposalAction(proposal._id, "rejected")}
                                      disabled={actionId === proposal._id}
                                    >
                                      <XCircle className="mr-1 h-3 w-3" /> Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </AnimatedSection>
            )}

            {/* Submit Proposal Form (For freelancers) */}
            {!isOwner && user && project.status === "open" && !myProposal && (
              <AnimatedSection animation="slideUp" delay={160}>
                <Card className="border-primary/20">
                  <CardContent className="p-6">
                    <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <Send className="h-4 w-4 text-primary" /> Submit Your Proposal
                    </h2>
                    <form onSubmit={handleSubmitProposal} className="space-y-4">
                      <div className="space-y-2">
                        <Label className={labelClass}>Cover Letter *</Label>
                        <Textarea
                          placeholder="Explain your approach, relevant experience, and why you're the best fit..."
                          className="bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10 min-h-[120px] resize-none"
                          value={form.coverLetter}
                          onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                          required
                          disabled={submitting}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className={labelClass}>Your Price (USD) *</Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="e.g. 500"
                            className={inputClass}
                            value={form.proposedBudget}
                            onChange={(e) => setForm({ ...form, proposedBudget: e.target.value })}
                            required
                            disabled={submitting}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className={labelClass}>Timeline (Days) *</Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="e.g. 14"
                            className={inputClass}
                            value={form.timeline}
                            onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                            required
                            disabled={submitting}
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full btn-glow h-11" disabled={submitting}>
                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        {submitting ? "Submitting..." : "Submit Proposal"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {/* Already submitted */}
            {myProposal && (
              <AnimatedSection animation="slideUp" delay={160}>
                <Card className="border-accent/20">
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-8 w-8 text-accent mx-auto mb-3" />
                    <h2 className="font-bold mb-1">Proposal Submitted</h2>
                    <p className="text-xs text-muted-foreground font-serif">
                      Status: <span className="capitalize text-primary font-mono">{myProposal.status}</span>
                    </p>
                    {myProposal.status === "accepted" && (
                      <Link href="/dashboard/messages">
                        <Button className="btn-glow mt-4">Go to Messages</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {/* Not logged in */}
            {!user && project.status === "open" && (
              <AnimatedSection animation="slideUp" delay={160}>
                <Card className="card-shimmer">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-4 font-serif">Log in to submit a proposal for this project</p>
                    <Link href="/login"><Button className="btn-glow">Log In</Button></Link>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <AnimatedSection animation="slideUp" delay={80}>
              <Card className="card-shimmer">
                <CardContent className="p-5 space-y-4">
                  <h2 className="font-mono text-[10px] tracking-[0.15em] uppercase text-primary/60">Project Details</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><DollarSign className="h-3 w-3" />Budget</span>
                      <span className="stat-number text-sm font-bold text-accent">${project.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3" />Duration</span>
                      <span className="stat-number text-sm font-bold">{project.duration} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Zap className="h-3 w-3" />Level</span>
                      <span className="text-sm font-bold capitalize">{project.expertiseLevel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Users className="h-3 w-3" />Proposals</span>
                      <span className="stat-number text-sm font-bold">{proposalCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Client Info */}
            <AnimatedSection animation="slideUp" delay={160}>
              <Card className="card-shimmer">
                <CardContent className="p-5">
                  <h2 className="font-mono text-[10px] tracking-[0.15em] uppercase text-primary/60 mb-3">Posted By</h2>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={project.clientId?.image} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-mono">
                        {project.clientId?.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold">{project.clientId?.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
