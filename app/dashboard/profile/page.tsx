"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AnimatedSection } from "@/components/animated-section"
import { useToast } from "@/hooks/use-toast"
import { Save, Loader2, X, Plus } from "lucide-react"

interface ProfileData {
  name: string
  username: string
  bio: string
  skills: string[]
  hourlyRate: number | ""
  location: string
  image: string
}

export default function ProfileEditPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newSkill, setNewSkill] = useState("")

  const [form, setForm] = useState<ProfileData>({
    name: "",
    username: "",
    bio: "",
    skills: [],
    hourlyRate: "",
    location: "",
    image: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/users/profile")
        const data = await res.json()
        if (data.user) {
          const u = data.user
          setForm({
            name: u.name || "",
            username: u.username || generateUsername(u.name),
            bio: u.bio || "",
            skills: u.skills || [],
            hourlyRate: u.hourlyRate || "",
            location: u.location || "",
            image: u.image || "",
          })
        }
      } catch {
        toast({ title: "Error", description: "Failed to load profile", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [toast])

  const generateUsername = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
    const rand = Math.floor(Math.random() * 900) + 100
    return `${slug}-${rand}`
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name required", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          username: form.username.trim(),
          bio: form.bio.trim(),
          skills: form.skills,
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
          location: form.location.trim(),
          image: form.image.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to save")
      }

      toast({ title: "Profile saved!", description: "Your changes are live." })
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    const skill = newSkill.trim()
    if (skill && !form.skills.includes(skill)) {
      setForm({ ...form, skills: [...form.skills, skill] })
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setForm({ ...form, skills: form.skills.filter((s) => s !== skill) })
  }

  const inputClass = "bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10 h-11"
  const labelClass = "font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground"

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <AnimatedSection animation="slideUp" delay={0}>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-2 block">
              Settings
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight">Edit Profile</h1>
          </div>
          <Button onClick={handleSave} disabled={saving} className="btn-glow">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </AnimatedSection>

      {/* Basic Info */}
      <AnimatedSection animation="slideUp" delay={80}>
        <Card className="card-shimmer">
          <CardContent className="p-6 space-y-5">
            <h2 className="text-sm font-bold mb-1">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="name" className={labelClass}>Full Name *</Label>
                <Input
                  id="name"
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className={labelClass}>Username</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-xs text-muted-foreground font-mono">skillsync.com/u/</span>
                  <Input
                    id="username"
                    className={`${inputClass} pl-[120px]`}
                    value={form.username}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="location" className={labelClass}>Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. Mumbai, India"
                  className={inputClass}
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate" className={labelClass}>Hourly Rate (USD)</Label>
                <Input
                  id="rate"
                  type="number"
                  min="0"
                  placeholder="e.g. 50"
                  className={inputClass}
                  value={form.hourlyRate}
                  onChange={(e) => setForm({ ...form, hourlyRate: e.target.value ? Number(e.target.value) : "" })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className={labelClass}>Avatar Image URL</Label>
              <Input
                id="image"
                placeholder="https://example.com/your-photo.jpg"
                className={inputClass}
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
              />
              {form.image && (
                <div className="mt-2">
                  <img
                    src={form.image}
                    alt="Avatar preview"
                    className="h-16 w-16 rounded-full object-cover border border-border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Bio */}
      <AnimatedSection animation="slideUp" delay={160}>
        <Card className="card-shimmer">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-sm font-bold">Bio</h2>
            <Textarea
              placeholder="Tell clients about yourself, your experience, and what makes you unique..."
              className="bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10 min-h-[120px] resize-none"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
            <p className="text-[10px] font-mono text-muted-foreground">
              {form.bio.length}/500 characters
            </p>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Skills */}
      <AnimatedSection animation="slideUp" delay={240}>
        <Card className="card-shimmer">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-sm font-bold">Skills</h2>

            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (e.g. React, Python)"
                className={`flex-1 ${inputClass}`}
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addSkill()
                  }
                }}
              />
              <Button variant="outline" onClick={addSkill} className="h-11 px-4">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {form.skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase text-primary/80 border border-primary/20 px-3 py-1.5 rounded bg-primary/5"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {form.skills.length === 0 && (
                <p className="text-xs text-muted-foreground font-serif italic">No skills added yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Bottom Save */}
      <AnimatedSection animation="slideUp" delay={320}>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="btn-glow px-8">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? "Saving..." : "Save All Changes"}
          </Button>
        </div>
      </AnimatedSection>
    </div>
  )
}
