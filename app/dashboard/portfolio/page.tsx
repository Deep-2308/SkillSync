"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AnimatedSection } from "@/components/animated-section"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, ExternalLink, Loader2, Image as ImageIcon } from "lucide-react"

interface PortfolioItem {
  _id: string
  title: string
  description: string
  link?: string
  image?: string
}

export default function PortfolioPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    link: "",
    image: "",
  })

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch("/api/users/profile")
        const data = await res.json()
        if (data.user?.portfolio) setItems(data.user.portfolio)
      } catch {
        // handled gracefully
      } finally {
        setLoading(false)
      }
    }
    fetchPortfolio()
  }, [])

  const handleAdd = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title required", variant: "destructive" })
      return
    }

    setAdding(true)
    try {
      const res = await fetch("/api/users/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to add")

      setItems(data.portfolio)
      setForm({ title: "", description: "", link: "", image: "" })
      setShowForm(false)
      toast({ title: "Portfolio item added!" })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item",
        variant: "destructive",
      })
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/users/portfolio?id=${id}`, { method: "DELETE" })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to delete")

      setItems(data.portfolio)
      toast({ title: "Item removed" })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
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
              Showcase
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight">Portfolio</h1>
            <p className="font-serif text-muted-foreground italic text-sm mt-1">
              Add your best work to attract clients
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="btn-glow">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </AnimatedSection>

      {/* Add Form */}
      {showForm && (
        <AnimatedSection animation="slideUp" delay={0}>
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-sm font-bold">New Portfolio Item</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Title *</Label>
                  <Input
                    className={inputClass}
                    placeholder="e.g. E-Commerce Dashboard"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Project Link</Label>
                  <Input
                    className={inputClass}
                    placeholder="https://example.com"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className={labelClass}>Description</Label>
                <Textarea
                  className="bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10 min-h-[80px] resize-none"
                  placeholder="Brief description of what you built..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className={labelClass}>Cover Image URL</Label>
                <Input
                  className={inputClass}
                  placeholder="https://example.com/screenshot.png"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={adding} className="btn-glow">
                  {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  {adding ? "Adding..." : "Add to Portfolio"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      )}

      {/* Portfolio Grid */}
      {items.length === 0 ? (
        <AnimatedSection animation="fadeIn" delay={80}>
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <ImageIcon className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground font-serif italic">No portfolio items yet</p>
            <p className="text-xs text-muted-foreground mt-1">Click &quot;Add Item&quot; to showcase your work</p>
          </div>
        </AnimatedSection>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((item, index) => (
            <AnimatedSection key={item._id} animation="fadeIn" delay={80 + index * 60}>
              <Card className="card-shimmer group overflow-hidden">
                {item.image && (
                  <div className="h-40 bg-muted overflow-hidden">
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
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors truncate">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 font-serif">{item.description}</p>
                      )}
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-mono text-primary hover:text-primary/80 mt-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Project
                        </a>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => handleDelete(item._id)}
                      disabled={deletingId === item._id}
                    >
                      {deletingId === item._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      )}
    </div>
  )
}
