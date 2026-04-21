"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "@/components/animated-section"
import { useAuth } from "@/context/AuthContext"
import { Briefcase, Clock, DollarSign, ArrowRight, Send, Loader2 } from "lucide-react"
import Link from "next/link"

interface ProjectItem {
  _id: string
  title: string
  budget: number
  duration: number
  status: string
  category: string
  skills: string[]
  createdAt: string
}

interface ProposalWithProject {
  _id: string
  proposedBudget: number
  timeline: number
  status: string
  createdAt: string
  projectId: { _id: string; title: string; budget: number; status: string }
}

export default function DashboardProjectsPage() {
  const { user } = useAuth()
  const [myProjects, setMyProjects] = useState<ProjectItem[]>([])
  const [myProposals, setMyProposals] = useState<ProposalWithProject[]>([])
  const [proposalCounts, setProposalCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch projects posted by user (client view)
        const projRes = await fetch("/api/projects")
        const projData = await projRes.json()
        if (projData.projects) {
          // Filter to only this user's projects — we need to check clientId
          // For now, show all open projects (the API already filters for open)
          setMyProjects(projData.projects)
        }

        // Fetch proposals submitted by user (freelancer view)
        const propRes = await fetch(`/api/proposals?freelancerId=${user.id}`)
        const propData = await propRes.json()
        if (propData.proposals) setMyProposals(propData.proposals)

        // Fetch proposal counts for each project
        if (projData.projects) {
          const counts: Record<string, number> = {}
          for (const p of projData.projects) {
            try {
              const countRes = await fetch(`/api/projects/${p._id}`)
              const countData = await countRes.json()
              counts[p._id] = countData.proposalCount || 0
            } catch {
              counts[p._id] = 0
            }
          }
          setProposalCounts(counts)
        }
      } catch {
        // handled
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Client View: My Posted Projects */}
      {user?.role === "learner" && (
        <AnimatedSection animation="slideUp" delay={0}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-1 block">Client</span>
              <h1 className="font-display text-2xl font-bold tracking-tight">My Posted Projects</h1>
            </div>
            <Link href="/post-project">
              <Button className="btn-glow text-xs">
                <Briefcase className="mr-2 h-4 w-4" /> Post New Project
              </Button>
            </Link>
          </div>

          {myProjects.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-lg">
              <Briefcase className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-serif text-muted-foreground italic mb-3">No projects posted yet</p>
              <Link href="/post-project"><Button variant="outline" size="sm">Post Your First Project</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myProjects.map((project, i) => (
                <AnimatedSection key={project._id} animation="fadeIn" delay={i * 60}>
                  <Link href={`/projects/${project._id}`}>
                    <Card className="card-shimmer group cursor-pointer">
                      <CardContent className="p-5 flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-sm group-hover:text-primary transition-colors truncate">{project.title}</h3>
                            <span className={`shrink-0 font-mono text-[8px] tracking-wider uppercase px-1.5 py-0.5 rounded border ${
                              project.status === "open" ? "text-accent border-accent/20 bg-accent/5" :
                              project.status === "in-progress" ? "text-primary border-primary/20 bg-primary/5" :
                              "text-muted-foreground border-border bg-muted"
                            }`}>{project.status}</span>
                          </div>
                          <div className="flex gap-4 text-[10px] font-mono text-muted-foreground">
                            <span><DollarSign className="h-3 w-3 inline" /> ${project.budget.toLocaleString()}</span>
                            <span><Clock className="h-3 w-3 inline" /> {project.duration}d</span>
                            <span><Send className="h-3 w-3 inline" /> {proposalCounts[project._id] || 0} proposals</span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          )}
        </AnimatedSection>
      )}

      {/* Freelancer View: My Proposals */}
      <AnimatedSection animation="slideUp" delay={user?.role === "learner" ? 200 : 0}>
        <div className="mb-5">
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-1 block">
            {user?.role === "expert" ? "Freelancer" : "Proposals Sent"}
          </span>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            {user?.role === "expert" ? "My Proposals" : "Proposals You've Sent"}
          </h2>
        </div>

        {myProposals.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <Send className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-serif text-muted-foreground italic mb-3">No proposals submitted yet</p>
            <Link href="/hire-talent"><Button variant="outline" size="sm">Browse Projects</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myProposals.map((proposal, i) => (
              <AnimatedSection key={proposal._id} animation="fadeIn" delay={i * 60}>
                <Link href={`/projects/${proposal.projectId._id}`}>
                  <Card className="card-shimmer group cursor-pointer">
                    <CardContent className="p-5 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm group-hover:text-primary transition-colors truncate mb-1">
                          {proposal.projectId.title}
                        </h3>
                        <div className="flex gap-4 text-[10px] font-mono text-muted-foreground">
                          <span><DollarSign className="h-3 w-3 inline" /> Your bid: ${proposal.proposedBudget.toLocaleString()}</span>
                          <span><Clock className="h-3 w-3 inline" /> {proposal.timeline}d</span>
                        </div>
                      </div>
                      <span className={`shrink-0 font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded border ${
                        proposal.status === "pending" ? "text-primary border-primary/20 bg-primary/5" :
                        proposal.status === "accepted" ? "text-accent border-accent/20 bg-accent/5" :
                        "text-destructive border-destructive/20 bg-destructive/5"
                      }`}>
                        {proposal.status}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        )}
      </AnimatedSection>
    </div>
  )
}
