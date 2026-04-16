"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight } from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"
import { useToast } from "@/hooks/use-toast"

export default function ContactPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      toast({
        title: "Message Sent!",
        description: "We'll get back to you as soon as possible.",
      })

      setFormData({ firstName: "", lastName: "", email: "", message: "" })

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Left Side */}
          <AnimatedSection animation="slideInLeft" delay={0}>
            <div>
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-6 block">
                Contact
              </span>
              <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-8 leading-[0.92] tracking-tight">
                Get in
                <br />
                <span className="text-primary italic font-serif font-normal">Touch</span>
              </h1>

              <p className="font-serif text-lg text-muted-foreground mb-14 max-w-md leading-relaxed italic">
                If you would like to discuss a project or just say hi, we&apos;re always down to chat.
              </p>

              <div className="space-y-10">
                <div className="group">
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                    Email
                  </span>
                  <a
                    href="mailto:hello@skillsync.com"
                    className="text-xl font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    hello@skillsync.com
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </a>
                </div>

                <div>
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3 block">
                    Socials
                  </span>
                  <div className="flex flex-wrap gap-6">
                    {["LinkedIn", "Instagram", "GitHub", "Twitter"].map((social) => (
                      <a
                        key={social}
                        href="#"
                        className="font-mono text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {social}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Right Side — Form */}
          <AnimatedSection animation="slideInRight" delay={100}>
            <div className="bg-card border border-border rounded-lg p-8 md:p-10">
              <h2 className="text-xl font-bold text-foreground mb-8">Send a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Jane"
                      className="bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@example.com"
                    className="bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                    How can we help?
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your project..."
                    className="bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10 min-h-[130px] resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full btn-glow h-12 text-base tracking-wide group">
                  {loading ? "Sending..." : "Submit Message"}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </main>

      <Footer />
    </div>
  )
}
