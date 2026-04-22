import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code, Palette, PenTool, Megaphone, BarChart, Camera, Brain, Zap, Target, Users } from "lucide-react"
import Link from "next/link"
import { AnimatedSection } from "@/components/animated-section"

const categories = [
  { icon: Code, title: "Web Development", desc: "Full-stack developers, frontend specialists, backend engineers, and mobile app developers", tags: ["React", "Node.js", "Python", "Mobile"] },
  { icon: Palette, title: "Design & Creative", desc: "UI/UX designers, graphic designers, brand specialists, and creative directors", tags: ["UI/UX", "Branding", "Illustration", "Video"] },
  { icon: PenTool, title: "Writing & Content", desc: "Content writers, copywriters, technical writers, and content strategists", tags: ["Copywriting", "SEO", "Technical", "Blog"] },
  { icon: Megaphone, title: "Digital Marketing", desc: "SEO specialists, social media managers, PPC experts, and growth marketers", tags: ["SEO", "Social Media", "PPC", "Analytics"] },
  { icon: BarChart, title: "Data & Analytics", desc: "Data scientists, analysts, business intelligence experts, and researchers", tags: ["Python", "SQL", "Tableau", "ML"] },
  { icon: Camera, title: "Video & Photography", desc: "Video editors, photographers, animators, and multimedia specialists", tags: ["Editing", "Photography", "Animation", "3D"] },
]

const matchingSteps = [
  { label: "01", text: "Project requirements analyzed by AI" },
  { label: "02", text: "Freelancer database searched for matches" },
  { label: "03", text: "Top candidates ranked by compatibility" },
  { label: "04", text: "Personalized recommendations delivered" },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 ambient-glow overflow-hidden">
        <AnimatedSection animation="blurIn" delay={0}>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-4 block">Our Services</span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
              Expert Freelancers in
              <br />
              <span className="text-primary">Every Category</span>
            </h1>
            <p className="font-serif text-lg text-muted-foreground italic leading-relaxed max-w-2xl mx-auto">
              From web development to digital marketing, discover top-tier talent across all major freelance categories
              with our AI-powered matching system.
            </p>
          </div>
        </AnimatedSection>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </section>

      {/* Categories */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="slideUp" delay={0}>
            <div className="text-center mb-16">
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/50 mb-4 block">Categories</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Freelancer Categories</h2>
              <p className="font-serif text-muted-foreground italic">Browse our extensive network of verified professionals</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat, index) => (
              <AnimatedSection key={cat.title} animation="fadeIn" delay={80 + index * 60}>
                <Card className="card-shimmer group h-full">
                  <CardHeader>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                      <cat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{cat.title}</CardTitle>
                    <CardDescription className="font-serif text-sm leading-relaxed">{cat.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {cat.tags.map((tag) => (
                        <span key={tag} className="font-mono text-[10px] tracking-wider uppercase text-primary/70 border border-primary/15 px-2 py-0.5 rounded bg-primary/5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Decorative line */}
      <div className="max-w-5xl mx-auto px-4"><div className="line-accent-gold" /></div>

      {/* AI Matching */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="slideUp" delay={0}>
            <div className="text-center mb-16">
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/50 mb-4 block">Technology</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">AI-Powered Skill Matching</h2>
              <p className="font-serif text-muted-foreground italic">Our advanced algorithms ensure perfect project-freelancer matches</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <AnimatedSection animation="slideInLeft" delay={100}>
              <div className="space-y-8">
                {[
                  { icon: Brain, title: "Intelligent Analysis", desc: "Our AI analyzes project requirements, complexity, timeline, and budget to understand exactly what you need." },
                  { icon: Target, title: "Precision Matching", desc: "Match with freelancers based on skills, experience level, past project success, and availability." },
                  { icon: Zap, title: "Instant Results", desc: "Get matched with qualified freelancers within minutes, not days. Start your project faster than ever." },
                  { icon: Users, title: "Quality Assurance", desc: "All matches are verified for quality and compatibility, ensuring successful project outcomes." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="font-serif text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection animation="slideInRight" delay={200}>
              <Card className="card-shimmer">
                <CardHeader className="text-center pb-6">
                  <CardTitle>How Matching Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {matchingSteps.map((step) => (
                    <div key={step.label} className="flex items-center gap-4 p-3 rounded-lg border border-border/30 bg-muted/30">
                      <span className="stat-number text-sm font-medium text-primary w-6">{step.label}</span>
                      <p className="font-serif text-sm text-muted-foreground">{step.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 ambient-glow overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <AnimatedSection animation="blurIn" delay={0}>
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Find Your Perfect Match
            </h2>
            <p className="font-serif text-lg text-muted-foreground mb-10 italic">
              Start your project today and get matched with top freelancers in minutes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/post-project">
                <Button size="lg" className="btn-glow text-base px-8 h-12">Post a Project</Button>
              </Link>
              <Link href="/hire-talent">
                <Button variant="outline" size="lg" className="text-base px-8 h-12 bg-transparent border-border hover:border-primary/40 hover:bg-primary/5">
                  Browse Freelancers
                </Button>
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>

      <Footer />
    </div>
  )
}
