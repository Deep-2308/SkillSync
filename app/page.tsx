import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Users, Zap, Brain, CreditCard, UserCheck, Workflow, ArrowRight, CheckCircle, TrendingUp, Award, Sparkles } from "lucide-react"
import Link from "next/link"
import { HeroButtons } from "@/components/hero-buttons"
import { AnimatedSection } from "@/components/animated-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[90vh] flex items-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" style={{animationDelay: '1s'}} />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="particle" style={{left: '10%'}} />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
        </div>

        <div className="max-w-7xl mx-auto w-full py-24 relative z-10">
          <div className="max-w-4xl">
            <span className="reveal-up inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase text-primary/80 mb-8 border border-primary/20 px-4 py-2 rounded-full bg-primary/5 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 animate-pulse-glow" />
              Now Live — AI-Powered Matching
            </span>

            <h1 className="reveal-up reveal-delay-1 font-display text-5xl sm:text-7xl md:text-[5.5rem] font-bold tracking-tight mb-8 leading-[0.92]">
              Hire Smarter.
              <br />
              <span className="text-gradient-brand">Work Better.</span>
            </h1>

            <p className="reveal-up reveal-delay-2 text-lg sm:text-xl text-muted-foreground max-w-xl mb-12 leading-relaxed">
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

      {/* ─── Stats Bar ─── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection animation="fadeIn" delay={0}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { icon: Users, value: "50K+", label: "Active Users" },
                { icon: CheckCircle, value: "25K+", label: "Projects Done" },
                { icon: Award, value: "4.9/5", label: "Avg Rating" },
                { icon: TrendingUp, value: "98%", label: "Success Rate" },
              ].map((stat, i) => (
                <AnimatedSection key={stat.label} animation="scaleIn" delay={100 + i * 80}>
                  <div className="text-center group">
                    <stat.icon className="h-5 w-5 text-primary/60 mx-auto mb-2 group-hover:text-primary transition-colors" />
                    <div className="stat-number text-2xl md:text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-[11px] font-mono text-muted-foreground tracking-wider uppercase">{stat.label}</div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatedSection animation="slideUp" delay={0}>
            <div className="text-center mb-16">
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/50 mb-4 block">Features</span>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                Why Choose <span className="text-gradient-brand">SkillSync</span>?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform offers everything you need for successful freelance collaborations
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Brain, title: "AI Skill Matching", desc: "Advanced algorithms match projects with the perfect freelancers based on skills, experience, and availability.", color: "text-primary", bg: "bg-primary/10", hoverBg: "group-hover:bg-primary/20" },
              { icon: CreditCard, title: "Secure Payments", desc: "Protected escrow system ensures safe transactions with milestone-based payments and dispute resolution.", color: "text-brand-emerald", bg: "bg-brand-emerald/10", hoverBg: "group-hover:bg-brand-emerald/20" },
              { icon: UserCheck, title: "Verified Reviews", desc: "Authentic feedback system with verified reviews from real projects to help you make informed decisions.", color: "text-brand-coral", bg: "bg-brand-coral/10", hoverBg: "group-hover:bg-brand-coral/20" },
              { icon: Workflow, title: "Easy Hiring", desc: "Streamlined workflow from project posting to completion with built-in communication and project management.", color: "text-primary", bg: "bg-primary/10", hoverBg: "group-hover:bg-primary/20" },
            ].map((feature, index) => (
              <AnimatedSection key={feature.title} animation="fadeIn" delay={100 + index * 80}>
                <Card className="card-shimmer group h-full">
                  <CardHeader>
                    <div className={`h-12 w-12 rounded-xl ${feature.bg} ${feature.hoverBg} flex items-center justify-center mb-4 transition-colors duration-300`}>
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Decorative Line ─── */}
      <div className="max-w-5xl mx-auto px-4"><div className="line-accent-gold" /></div>

      {/* ─── How It Works ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card/40 relative">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="slideUp" delay={0}>
            <div className="text-center mb-16">
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/50 mb-4 block">Process</span>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                How It <span className="text-gradient-brand">Works</span>
              </h2>
              <p className="text-muted-foreground">Get started in three simple steps</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              { num: "01", title: "Post Your Project", desc: "Describe your project requirements, budget, and timeline. Our AI will analyze and categorize your needs.", color: "text-primary/20" },
              { num: "02", title: "Get Matched", desc: "Receive proposals from pre-screened freelancers who perfectly match your project requirements and budget.", color: "text-brand-emerald/20" },
              { num: "03", title: "Complete Securely", desc: "Work with your chosen freelancer using our secure platform with milestone payments and built-in communication.", color: "text-brand-coral/20" },
            ].map((step, index) => (
              <AnimatedSection key={step.num} animation="slideUp" delay={100 + index * 120}>
                <div className="text-center group">
                  <span className={`stat-number text-7xl font-bold ${step.color} block mb-5 group-hover:text-primary/30 transition-colors duration-500`}>{step.num}</span>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-mesh opacity-20" />
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatedSection animation="slideUp" delay={0}>
            <div className="text-center mb-16">
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/50 mb-4 block">Testimonials</span>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                What Our Users <span className="text-gradient-brand">Say</span>
              </h2>
              <p className="text-muted-foreground">Join thousands of satisfied clients and freelancers</p>
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
                        <Star key={i} className="h-3.5 w-3.5 text-brand-coral fill-brand-coral" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-mono text-primary font-medium">{t.initials}</span>
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
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

        <AnimatedSection animation="blurIn" delay={0}>
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Ready to Get <span className="text-gradient-brand">Started</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Join thousands of successful projects on SkillSync today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/post-project">
                <Button size="lg" className="btn-glow text-base px-8 h-12 bg-primary hover:bg-primary/90">
                  For Clients
                  <Users className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/hire-talent">
                <Button variant="outline" size="lg" className="text-base px-8 h-12 bg-transparent border-border hover:border-primary/40 hover:bg-primary/5">
                  For Freelancers
                  <ArrowRight className="ml-2 h-4 w-4" />
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
