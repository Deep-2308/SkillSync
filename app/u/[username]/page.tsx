"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatedSection } from "@/components/animated-section"
import { Star, MapPin, Clock, ExternalLink, Briefcase, Zap, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PortfolioItem {
  _id: string
  title: string
  description: string
  link?: string
  image?: string
}

interface PublicUser {
  name: string
  username: string
  role: string
  image?: string
  bio?: string
  skills?: string[]
  hourlyRate?: number
  location?: string
  portfolio?: PortfolioItem[]
  rating: number
  reviewCount: number
  createdAt: string
}

export default function PublicProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [user, setUser] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${username}`)
        if (res.status === 404) {
          setNotFound(true)
          return
        }
        const data = await res.json()
        if (data.user) setUser(data.user)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    if (username) fetchUser()
  }, [username])

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

  if (notFound || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <h1 className="font-display text-4xl font-bold mb-4 tracking-tight">Profile Not Found</h1>
          <p className="font-serif text-muted-foreground italic mb-8">
            The user &quot;{username}&quot; doesn&apos;t exist or hasn&apos;t set up their profile yet.
          </p>
          <Link href="/hire-talent">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Browse Freelancers
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Hero / Profile Header */}
        <AnimatedSection animation="slideUp" delay={0}>
          <div className="rounded-lg border border-border/40 bg-card overflow-hidden mb-10">
            {/* Banner */}
            <div className="h-32 md:h-40 bg-gradient-to-br from-primary/20 via-background to-accent/10 relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20256%20256%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22n%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.85%22%20numOctaves=%224%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23n)%22/%3E%3C/svg%3E')] opacity-[0.03]" />
            </div>

            {/* Profile Info */}
            <div className="px-6 md:px-8 pb-8 -mt-12 md:-mt-14 relative z-10">
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end">
                <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-card rounded-full shadow-lg">
                  <AvatarImage src={user.image || ""} className="object-cover" />
                  <AvatarFallback className="text-3xl font-display bg-primary/10 text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{user.name}</h1>
                    {user.role === "expert" && (
                      <span className="flex items-center gap-1 font-mono text-[9px] tracking-wider uppercase border border-accent/20 bg-accent/5 text-accent px-2 py-0.5 rounded">
                        <Zap className="h-2.5 w-2.5 fill-accent" /> Expert
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">@{user.username}</p>
                </div>

                <div className="flex gap-6 text-center sm:text-right">
                  <div>
                    <p className="stat-number text-2xl font-bold text-primary">{user.rating || "—"}</p>
                    <p className="font-mono text-[9px] tracking-wider uppercase text-muted-foreground">Rating</p>
                  </div>
                  <div>
                    <p className="stat-number text-2xl font-bold">{user.reviewCount}</p>
                    <p className="font-mono text-[9px] tracking-wider uppercase text-muted-foreground">Reviews</p>
                  </div>
                  {user.hourlyRate && (
                    <div>
                      <p className="stat-number text-2xl font-bold text-accent">${user.hourlyRate}</p>
                      <p className="font-mono text-[9px] tracking-wider uppercase text-muted-foreground">/hour</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mt-5 text-xs text-muted-foreground">
                {user.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" /> {user.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Bio + Skills */}
          <div className="lg:col-span-1 space-y-6">
            {/* Bio */}
            {user.bio && (
              <AnimatedSection animation="slideUp" delay={80}>
                <Card className="card-shimmer">
                  <CardContent className="p-5">
                    <h2 className="font-mono text-[10px] tracking-[0.15em] uppercase text-primary/60 mb-3">About</h2>
                    <p className="font-serif text-sm text-muted-foreground leading-relaxed">{user.bio}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {/* Skills */}
            {user.skills && user.skills.length > 0 && (
              <AnimatedSection animation="slideUp" delay={160}>
                <Card className="card-shimmer">
                  <CardContent className="p-5">
                    <h2 className="font-mono text-[10px] tracking-[0.15em] uppercase text-primary/60 mb-3">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill) => (
                        <span
                          key={skill}
                          className="font-mono text-[9px] tracking-wider uppercase text-primary/80 border border-primary/20 px-2.5 py-1 rounded bg-primary/5"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {/* Quick Contact */}
            <AnimatedSection animation="slideUp" delay={240}>
              <Card className="card-shimmer">
                <CardContent className="p-5">
                  <h2 className="font-mono text-[10px] tracking-[0.15em] uppercase text-primary/60 mb-3">
                    Hire {user.name.split(" ")[0]}
                  </h2>
                  <Button className="w-full btn-glow">Send a Proposal</Button>
                  <p className="text-[10px] text-center text-muted-foreground mt-3 font-mono">
                    Proposals will be available in Phase 2
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          {/* Right Column: Portfolio */}
          <div className="lg:col-span-2">
            <AnimatedSection animation="slideUp" delay={120}>
              <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-5 flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5" /> Portfolio
              </h2>
            </AnimatedSection>

            {!user.portfolio || user.portfolio.length === 0 ? (
              <AnimatedSection animation="fadeIn" delay={200}>
                <div className="text-center py-16 border border-dashed border-border rounded-lg">
                  <p className="font-serif text-muted-foreground italic">No portfolio items yet</p>
                </div>
              </AnimatedSection>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {user.portfolio.map((item, index) => (
                  <AnimatedSection key={item._id} animation="fadeIn" delay={200 + index * 80}>
                    <Card className="card-shimmer group overflow-hidden">
                      {item.image && (
                        <div className="h-44 bg-muted overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none"
                            }}
                          />
                        </div>
                      )}
                      <CardContent className="p-5">
                        <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-xs text-muted-foreground font-serif line-clamp-3 mb-3">
                            {item.description}
                          </p>
                        )}
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="h-3 w-3" /> View Project
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
