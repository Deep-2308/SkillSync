import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Users, Zap, Brain, CreditCard, UserCheck, Workflow } from "lucide-react"
import Link from "next/link"
import { HeroButtons } from "@/components/hero-buttons"
import { AnimatedSection } from "@/components/animated-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[85vh] flex items-center px-4 sm:px-6 lg:px-8 ambient-glow overflow-hidden">
        <div className="max-w-7xl mx-auto w-full py-24 relative z-10">
          <div className="max-w-4xl">
            <span className="reveal-up inline-block font-mono text-[11px] tracking-[0.2em] uppercase text-primary/80 mb-8 border border-primary/20 px-4 py-1.5 rounded-full bg-primary/5">
              ● Now Live — AI-Powered Matching
            </span>

            <h1 className="reveal-up reveal-delay-1 font-display text-5xl sm:text-7xl md:text-[5.5rem] font-bold tracking-tight mb-8 leading-[0.92]">
              Hire Smarter.
              <br />
              <span className="text-primary">Work Better.</span>
            </h1>

            <p className="reveal-up reveal-delay-2 font-serif text-lg sm:text-xl text-muted-foreground max-w-xl mb-12 leading-relaxed italic">
              Connect with top freelancers through AI-powered skill matching,
              secure payments, and verified reviews.
            </p>

            <div className="reveal-up reveal-delay-3">
              <HeroButtons />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </section>

      {/* ─── About Intro ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="slideUp" delay={0}>
          <div className="max-w-3xl mx-auto text-center">
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/50 mb-4 block">About</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Connecting Talent with Opportunity
            </h2>
            <p className="font-serif text-lg text-muted-foreground leading-relaxed italic">
              SkillSync revolutionizes the freelance marketplace by connecting clients and freelancers through intelligent
              skill-based matching, ensuring perfect project fits every time. Our platform combines cutting-edge AI
              technology with secure payment processing and comprehensive review systems.
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* Decorative line */}
      <div className="max-w-5xl mx-auto px-4"><div className="line-accent-gold" /></div>

      {/* ─── Features Section ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="slideUp" delay={0}>
            <div className="text-center mb-16">
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/50 mb-4 block">Features</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose SkillSync?</h2>
              <p className="font-serif text-muted-foreground max-w-2xl mx-auto italic">
                Our platform offers everything you need for successful freelance collaborations
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Brain, title: "AI Skill Matching", desc: "Advanced algorithms match projects with the perfect freelancers based on skills, experience, and availability." },
              { icon: CreditCard, title: "Secure Payments", desc: "Protected escrow system ensures safe transactions with milestone-based payments and dispute resolution." },
              { icon: UserCheck, title: "Verified Reviews", desc: "Authentic feedback system with verified reviews from real projects to help you make informed decisions." },
              { icon: Workflow, title: "Easy Hiring", desc: "Streamlined workflow from project posting to completion with built-in communication and project management." },
            ].map((feature, index) => (
              <AnimatedSection key={feature.title} animation="fadeIn" delay={100 + index * 80}>
                <Card className="card-shimmer group h-full">
                  <CardHeader>
                    <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-serif text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card/40">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="slideUp" delay={0}>
            <div className="text-center mb-16">
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/50 mb-4 block">Process</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
              <p className="font-serif text-muted-foreground italic">Get started in three simple steps</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              { num: "01", title: "Post Your Project", desc: "Describe your project requirements, budget, and timeline. Our AI will analyze and categorize your needs." },
              { num: "02", title: "Get Matched", desc: "Receive proposals from pre-screened freelancers who perfectly match your project requirements and budget." },
              { num: "03", title: "Complete Securely", desc: "Work with your chosen freelancer using our secure platform with milestone payments and built-in communication." },
            ].map((step, index) => (
              <AnimatedSection key={step.num} animation="slideUp" delay={100 + index * 120}>
                <div className="text-center">
                  <span className="stat-number text-6xl font-medium text-primary/15 block mb-5">{step.num}</span>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="font-serif text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="slideUp" delay={0}>
            <div className="text-center mb-16">
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/50 mb-4 block">Testimonials</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What Our Users Say</h2>
              <p className="font-serif text-muted-foreground italic">Join thousands of satisfied clients and freelancers</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: "SkillSync's AI matching is incredible. I found the perfect developer for my project within hours, not weeks.", name: "Deep Kabariya", role: "Startup Founder", initials: "DK" },
              { quote: "As a freelancer, SkillSync connects me with high-quality projects that match my skills perfectly. The payment system is reliable too.", name: "Pradip Dangodara", role: "Full-Stack Developer", initials: "PD" },
              { quote: "The secure payment system and verified reviews give me confidence in every transaction. Highly recommended!", name: "Gajera Akshit", role: "Marketing Director", initials: "GA" },
            ].map((t, index) => (
              <AnimatedSection key={t.name} animation="fadeIn" delay={100 + index * 100}>
                <Card className="card-shimmer h-full">
                  <CardContent className="pt-8 pb-6 px-6">
                    <div className="flex gap-0.5 mb-5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 text-primary fill-primary" />
                      ))}
                    </div>
                    <p className="font-serif text-sm text-muted-foreground mb-6 italic leading-relaxed">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-mono text-primary">{t.initials}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.name}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 ambient-glow overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <AnimatedSection animation="blurIn" delay={0}>
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Ready to Get Started?
            </h2>
            <p className="font-serif text-lg text-muted-foreground mb-10 italic">
              Join thousands of successful projects on SkillSync today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/post-project">
                <Button size="lg" className="btn-glow text-base px-8 h-12">
                  For Clients
                  <Users className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/hire-talent">
                <Button variant="outline" size="lg" className="text-base px-8 h-12 bg-transparent border-border hover:border-primary/40 hover:bg-primary/5">
                  For Freelancers
                  <Zap className="ml-2 h-4 w-4" />
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
