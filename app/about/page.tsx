import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Target, Users, Shield, Award, CheckCircle, TrendingUp } from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 ambient-glow overflow-hidden">
        <AnimatedSection animation="blurIn" delay={0}>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-4 block">
              About SkillSync
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
              Revolutionizing Freelance
              <br />
              <span className="text-primary">Collaboration</span>
            </h1>
            <p className="font-serif text-lg text-muted-foreground italic leading-relaxed max-w-2xl mx-auto">
              We&apos;re building the future of work by connecting talented freelancers with visionary clients through
              intelligent matching and secure collaboration tools.
            </p>
          </div>
        </AnimatedSection>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </section>

      {/* Mission */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection animation="slideInLeft" delay={0}>
              <div>
                <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/50 mb-4 block">Our Mission</span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Eliminating Friction in Freelance Hiring
                </h2>
                <p className="font-serif text-lg text-muted-foreground mb-6 leading-relaxed italic">
                  At SkillSync, we believe that great work happens when the right people connect. Our mission is to
                  eliminate the friction in freelance hiring by using advanced AI to match projects with perfectly suited
                  talent.
                </p>
                <p className="font-serif text-lg text-muted-foreground leading-relaxed italic">
                  We&apos;re not just another freelance platform — we&apos;re a technology company focused on creating meaningful
                  connections that drive successful outcomes for both clients and freelancers.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="slideInRight" delay={100}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Users, value: "50K+", label: "Active Users" },
                  { icon: CheckCircle, value: "25K+", label: "Projects Done" },
                  { icon: Award, value: "4.9/5", label: "Avg Rating" },
                  { icon: TrendingUp, value: "98%", label: "Success Rate" },
                ].map((stat, index) => (
                  <AnimatedSection key={stat.label} animation="scaleIn" delay={200 + index * 80}>
                    <Card className="card-shimmer text-center">
                      <CardContent className="pt-6 pb-5">
                        <stat.icon className="h-7 w-7 text-primary mx-auto mb-3 opacity-70" />
                        <div className="stat-number text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                        <div className="text-[11px] font-mono text-muted-foreground tracking-wider uppercase">{stat.label}</div>
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Decorative line */}
      <div className="max-w-5xl mx-auto px-4"><div className="line-accent-gold" /></div>

      {/* Benefits */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="slideUp" delay={0}>
            <div className="text-center mb-16">
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/50 mb-4 block">Benefits</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why SkillSync Works</h2>
              <p className="font-serif text-muted-foreground max-w-2xl mx-auto italic">
                Our platform is built on three core principles that ensure success for everyone
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Target, title: "Precision Matching", desc: "Our AI analyzes project requirements, freelancer skills, past performance, and availability to create perfect matches. No more sifting through hundreds of irrelevant proposals." },
              { icon: Shield, title: "Trust & Security", desc: "Every freelancer is verified, all payments are secured through escrow, and our review system ensures transparency. Work with confidence knowing you're protected." },
              { icon: Users, title: "Community Focus", desc: "We foster long-term relationships between clients and freelancers. Our platform rewards quality work and builds lasting professional connections." },
            ].map((benefit, index) => (
              <AnimatedSection key={benefit.title} animation="fadeIn" delay={100 + index * 100}>
                <Card className="card-shimmer group h-full">
                  <CardHeader>
                    <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="font-serif text-sm leading-relaxed">
                      {benefit.desc}
                    </CardDescription>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Factors */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card/40">
        <AnimatedSection animation="slideUp" delay={0}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/50 mb-4 block">Trust</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Built for Trust</h2>
              <p className="font-serif text-muted-foreground italic">
                Trust is the foundation of every successful project.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Identity Verification", desc: "All users undergo thorough identity verification before joining the platform." },
                { title: "Secure Payments", desc: "Escrow system protects funds until project milestones are completed." },
                { title: "Dispute Resolution", desc: "Professional mediation team helps resolve any project conflicts fairly." },
                { title: "Quality Assurance", desc: "Continuous monitoring and feedback systems maintain high standards." },
              ].map((item, index) => (
                <AnimatedSection key={item.title} animation="fadeIn" delay={100 + index * 80}>
                  <div className="flex items-start gap-4 p-5 rounded-lg border border-border/40 bg-card/60 hover:border-primary/20 transition-colors">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-sm">{item.title}</h3>
                      <p className="font-serif text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </section>

      <Footer />
    </div>
  )
}
