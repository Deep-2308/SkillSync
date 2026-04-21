"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "@/components/animated-section"
import { useAuth } from "@/context/AuthContext"
import { Briefcase, Users, Clock, DollarSign, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"

interface ProjectItem {
  _id: string
  title: string
  budget: number
  status: string
  duration: number
  createdAt: string
  skills: string[]
}

interface ProposalItem {
  _id: string
  projectId: {
    _id: string
    title: string
    budget: number
    status: string
  }
  proposedBudget: number
  timeline: number
  status: string
  createdAt: string
}

export default function MyProjectsPage() {
  const { user } = useAuth()
  const [myProjects, setMyProjects] = useState<ProjectItem[]>([])
  const [myProposals, setMyProposals] = useState<ProposalItem[]>([])
  const [proposalCounts, setProposalCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all projects (to find ones by this user)
        const projRes = await fetch("/api/projects")
        const projData = await projRes.json()
        if (projData.projects && user) {
          const mine = projData.projects.filter(
            (p: ProjectItem & { clientId: string }) => p.clientId === user.id
          )
          setMyProjects(mine)

          // Fetch proposal counts for each project
          const counts: Record<string, number> = {}
          for (const p of mine) {
            try {
              const cRes = await fetch(`/api/proposals?projectId=${p._id}`)
              const cData = await cRes.json()
              counts[p._id] = cData.proposals?.length || 0
            } catch {
              counts[p._id] = 0
            }
          }
          setProposalCounts(counts)
        }

        // Fetch proposals submitted by this user
        if (user) {
          const propRes = await fetch(`/api/proposals?freelancerId=${user.id}`)
          const propData = await propRes.json()
          if (propData.proposals) setMyProposals(propData.proposals)
        }
      } catch {
        // handled
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchData()
  }, [user])

  const statusColor = (status: string) => {
    switch (status) {
      case "open": case "pending": return "text-primary border-primary/20 bg-primary/5"
      case "accepted": case "in-progress": return "text-accent border-accent/20 bg-accent/5"
      case "rejected": case "cancelled": return "text-destructive border-destructive/20 bg-destructive/5"
      case "completed": return "text-accent border-accent/20 bg-accent/5"
      default: return "text-muted-foreground border-border bg-muted"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* My Posted Projects (Client view) */}
      <AnimatedSection animation="slideUp" delay={0}>
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-1 block">Client</span>
              <h2 className="font-display text-xl font-bold tracking-tight">My Posted Projects</h2>
            </div>
            <Link href="/post-project">
              <Button size="sm" className="btn-glow text-xs">
                <Briefcase className="mr-1.5 h-3 w-3" /> Post New
              </Button>
            </Link>
          </div>

          {myProjects.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <Briefcase className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-serif text-muted-foreground italic text-sm">You haven&apos;t posted any projects yet</p>
              <Link href="/post-project">
                <Button variant="outline" size="sm" className="mt-3 text-xs">Post Your First Project</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myProjects.map((project, i) => (
                <AnimatedSection key={project._id} animation="fadeIn" delay={60 + i * 40}>
                  <Link href={`/projects/${project._id}`}>
                    <Card className="card-shimmer cursor-pointer group">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-sm group-hover:text-primary transition-colors truncate">{project.title}</h3>
                              <span className={`shrink-0 font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded border ${statusColor(project.status)}`}>
                                {project.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground mt-2">
                              <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${project.budget}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{project.duration}d</span>
                              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{proposalCounts[project._id] || 0} proposals</span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* My Proposals (Freelancer view) */}
      <AnimatedSection animation="slideUp" delay={100}>
        <div>
          <div className="mb-5">
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-1 block">Freelancer</span>
            <h2 className="font-display text-xl font-bold tracking-tight">My Proposals</h2>
          </div>

          {myProposals.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-serif text-muted-foreground italic text-sm">You haven&apos;t submitted any proposals yet</p>
              <Link href="/hire-talent">
                <Button variant="outline" size="sm" className="mt-3 text-xs">Browse Open Projects</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myProposals.map((proposal, i) => (
                <AnimatedSection key={proposal._id} animation="fadeIn" delay={160 + i * 40}>
                  <Link href={`/projects/${proposal.projectId?._id}`}>
                    <Card className="card-shimmer cursor-pointer group">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-sm group-hover:text-primary transition-colors truncate">
                                {proposal.projectId?.title || "Project"}
                              </h3>
                              <span className={`shrink-0 font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded border ${statusColor(proposal.status)}`}>
                                {proposal.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground mt-2">
                              <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />Your bid: ${proposal.proposedBudget}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{proposal.timeline}d</span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </AnimatedSection>
    </div>
  )
}
