"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { AnimatedSection } from "@/components/animated-section"
import { UserCircle, Briefcase, Star, MapPin, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

interface ProfileData {
  name: string
  email: string
  role: string
  username?: string
  bio?: string
  skills?: string[]
  hourlyRate?: number
  location?: string
  image?: string
  portfolio?: Array<{ _id: string; title: string }>
  rating: number
  reviewCount: number
  createdAt: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/users/profile")
        const data = await res.json()
        if (data.user) setProfile(data.user)
      } catch {
        // Handled gracefully
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // Calculate profile completeness
  const getCompleteness = () => {
    if (!profile) return 0
    const fields = [
      !!profile.name,
      !!profile.username,
      !!profile.bio,
      (profile.skills?.length || 0) > 0,
      !!profile.hourlyRate,
      !!profile.location,
      !!profile.image,
      (profile.portfolio?.length || 0) > 0,
    ]
    return Math.round((fields.filter(Boolean).length / fields.length) * 100)
  }

  const completeness = getCompleteness()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <AnimatedSection animation="slideUp" delay={0}>
        <div className="rounded-lg border border-border/40 bg-card p-6 md:p-8">
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-2 block">
            Welcome Back
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-2">
            {user?.name || "User"}
          </h1>
          <p className="font-serif text-muted-foreground italic text-sm">
            {profile?.role === "expert"
              ? "Manage your freelancer profile, showcase your work, and attract clients."
              : "Track your projects, manage hiring, and find the perfect talent."}
          </p>
        </div>
      </AnimatedSection>

      {/* Profile Completeness */}
      <AnimatedSection animation="slideUp" delay={80}>
        <Card className="card-shimmer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {completeness === 100 ? (
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-primary" />
                )}
                <div>
                  <h2 className="text-sm font-bold">Profile Completeness</h2>
                  <p className="text-xs text-muted-foreground font-mono">{completeness}% complete</p>
                </div>
              </div>
              {completeness < 100 && (
                <Link href="/dashboard/profile">
                  <Button size="sm" variant="outline" className="text-xs">
                    Complete Profile <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${completeness}%`,
                  background: completeness === 100
                    ? "var(--accent)"
                    : "linear-gradient(90deg, var(--primary), var(--accent))",
                }}
              />
            </div>

            {/* Missing Fields Hints */}
            {completeness < 100 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {!profile?.username && (
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-1 rounded border border-border bg-muted text-muted-foreground">
                    + Username
                  </span>
                )}
                {!profile?.bio && (
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-1 rounded border border-border bg-muted text-muted-foreground">
                    + Bio
                  </span>
                )}
                {(!profile?.skills || profile.skills.length === 0) && (
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-1 rounded border border-border bg-muted text-muted-foreground">
                    + Skills
                  </span>
                )}
                {!profile?.hourlyRate && (
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-1 rounded border border-border bg-muted text-muted-foreground">
                    + Hourly Rate
                  </span>
                )}
                {!profile?.location && (
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-1 rounded border border-border bg-muted text-muted-foreground">
                    + Location
                  </span>
                )}
                {!profile?.image && (
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-1 rounded border border-border bg-muted text-muted-foreground">
                    + Avatar
                  </span>
                )}
                {(!profile?.portfolio || profile.portfolio.length === 0) && (
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-1 rounded border border-border bg-muted text-muted-foreground">
                    + Portfolio
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Quick Stats */}
      <AnimatedSection animation="slideUp" delay={160}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="card-shimmer">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="stat-number text-2xl font-bold">{profile?.rating || 0}</p>
                <p className="text-xs text-muted-foreground font-mono">Rating</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-shimmer">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="stat-number text-2xl font-bold">{profile?.portfolio?.length || 0}</p>
                <p className="text-xs text-muted-foreground font-mono">Portfolio Items</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-shimmer">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="stat-number text-2xl font-bold">{profile?.reviewCount || 0}</p>
                <p className="text-xs text-muted-foreground font-mono">Reviews</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AnimatedSection>

      {/* Quick Links */}
      <AnimatedSection animation="slideUp" delay={240}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/dashboard/profile">
            <Card className="card-shimmer cursor-pointer group">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserCircle className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-bold group-hover:text-primary transition-colors">Edit Profile</p>
                    <p className="text-xs text-muted-foreground">Update your info, bio, and skills</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/portfolio">
            <Card className="card-shimmer cursor-pointer group">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-bold group-hover:text-primary transition-colors">Manage Portfolio</p>
                    <p className="text-xs text-muted-foreground">Showcase your best work</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>

          {profile?.username && (
            <Link href={`/u/${profile.username}`} target="_blank">
              <Card className="card-shimmer cursor-pointer group sm:col-span-2">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-bold group-hover:text-primary transition-colors">
                        Your Public Profile
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        skillsync.com/u/{profile.username}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </AnimatedSection>
    </div>
  )
}
