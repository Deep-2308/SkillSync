"use client"

import { useState, useEffect, useCallback } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Star, MapPin, Zap, Loader2 } from "lucide-react"
import { freelancers as staticFreelancers } from "@/data/freelancers"
import { AnimatedSection } from "@/components/animated-section"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Link from "next/link"

interface Freelancer {
  id: string
  _id?: string
  name: string
  role: string
  image?: string
  rating: number
  reviewCount: number
  location: string
  skills: string[]
}

export default function HireTalentPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)

  const fetchFreelancers = useCallback(async (search = "") => {
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)

      const res = await fetch(`/api/freelancers?${params.toString()}`)
      const data = await res.json()

      if (data.freelancers && data.freelancers.length > 0) {
        // Map DB results to component format
        const dbFreelancers: Freelancer[] = data.freelancers.map((f: Record<string, unknown>) => ({
          id: (f._id as string) || "",
          name: f.name as string,
          role: (f.bio as string) || "Freelancer",
          image: f.image as string,
          rating: (f.rating as number) || 4.5,
          reviewCount: (f.reviewCount as number) || 0,
          location: (f.location as string) || "Remote",
          skills: (f.skills as string[]) || [],
        }))
        setFreelancers(dbFreelancers)
      } else {
        // Fall back to static data, filtering by search query if provided
        if (search) {
          const query = search.toLowerCase()
          const filtered = staticFreelancers.filter(
            (f) =>
              f.name.toLowerCase().includes(query) ||
              f.role.toLowerCase().includes(query) ||
              f.skills.some((s) => s.toLowerCase().includes(query))
          )
          setFreelancers(filtered.length > 0 ? filtered : staticFreelancers)
        } else {
          setFreelancers(staticFreelancers)
        }
      }
    } catch {
      // API failed — use static data
      setFreelancers(staticFreelancers)
    } finally {
      setLoading(false)
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    fetchFreelancers()
  }, [fetchFreelancers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    fetchFreelancers(searchQuery)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setIsSearching(true)
    fetchFreelancers("")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="slideUp" delay={0}>
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-14">
              <div className="max-w-2xl">
                <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-3 block">Talent Pool</span>
                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                  Find Your <span className="text-primary">Perfect Match</span>
                </h1>
                <p className="font-serif text-muted-foreground text-lg italic">
                  Browse through our network of top-tier freelancers, verified by AI and reviewed by clients.
                </p>
              </div>
              <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search skills, roles..."
                    className="pl-9 bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="outline" className="border-border hover:border-primary/30 hover:bg-primary/5 bg-transparent" disabled={isSearching}>
                  {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Filter className="mr-2 h-4 w-4" />}
                  Search
                </Button>
                {searchQuery && (
                  <Button type="button" variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={clearSearch}>
                    Clear
                  </Button>
                )}
              </form>
            </div>
          </AnimatedSection>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground">Loading talent...</p>
              </div>
            </div>
          ) : freelancers.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground mb-4">No freelancers found matching your search.</p>
              <Button variant="outline" onClick={clearSearch}>Show all freelancers</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {freelancers.map((talent, index) => (
                <AnimatedSection key={talent.id || talent._id || index} animation="fadeIn" delay={80 + index * 60}>
                  <Card className="card-shimmer group overflow-hidden flex flex-col">
                    <CardHeader className="p-0 border-b border-border/30 relative h-48 bg-muted">
                      <Avatar className="h-full w-full rounded-none">
                        <AvatarImage src={talent.image || "/placeholder.svg"} className="object-cover" />
                        <AvatarFallback className="rounded-none text-2xl font-display text-primary/30">{talent.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute top-3 right-3 bg-background/70 backdrop-blur-sm border border-border/50 rounded px-2 py-1">
                        <Zap className="h-3 w-3 text-primary fill-primary" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-sm leading-tight mb-0.5 group-hover:text-primary transition-colors">
                            {talent.name}
                          </h3>
                          <p className="font-mono text-[11px] text-muted-foreground">{talent.role}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-mono">
                          <Star className="h-3 w-3 text-primary fill-primary" />
                          {talent.rating}
                        </div>
                      </div>

                      <div className="flex items-center text-[11px] text-muted-foreground mb-4 font-mono">
                        <MapPin className="h-3 w-3 mr-1" />
                        {talent.location}
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {talent.skills.map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-[9px] tracking-wider uppercase text-primary/70 border border-primary/15 px-2 py-0.5 rounded bg-primary/5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto pt-4 border-t border-border/30 flex justify-between items-center">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          <span className="text-foreground font-medium">{talent.reviewCount}</span> reviews
                        </span>
                        <Button size="sm" className="btn-glow text-xs h-8 px-4">Hire</Button>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          )}

          <AnimatedSection animation="slideUp" delay={400}>
            <div className="mt-20 p-8 md:p-10 rounded-lg border border-border/40 bg-card/60 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-lg">
                <h2 className="text-xl font-bold mb-2">Can&apos;t find what you&apos;re looking for?</h2>
                <p className="font-serif text-sm text-muted-foreground italic">
                  Post your project and let freelancers come to you with proposals.
                </p>
              </div>
              <Link href="/post-project">
                <Button size="lg" className="btn-glow px-8 h-12 tracking-wide whitespace-nowrap">
                  Post a Project
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
