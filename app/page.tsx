import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Users, Zap, Brain, CreditCard, UserCheck, Workflow } from "lucide-react"
import Link from "next/link"
import { HeroButtons } from "@/components/hero-buttons"
import { AnimatedSection } from "@/components/animated-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-muted">
        <AnimatedSection animation="fadeIn" delay={0}>
          <div className="max-w-7xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              🚀 Now Live - AI-Powered Matching
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              SkillSync – Smart Freelancer Hiring & Review Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
              Hire Smarter. Work Better. Connect with top freelancers through AI-powered skill matching, secure payments,
              and verified reviews.
            </p>
            <HeroButtons />
          </div>
        </AnimatedSection>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="slideUp" delay={100}>
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Connecting Talent with Opportunity</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
              SkillSync revolutionizes the freelance marketplace by connecting clients and freelancers through intelligent
              skill-based matching, ensuring perfect project fits every time. Our platform combines cutting-edge AI
              technology with secure payment processing and comprehensive review systems.
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="slideUp" delay={0}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose SkillSync?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform offers everything you need for successful freelance collaborations
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatedSection animation="fadeIn" delay={100}>
              <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>AI Skill Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced algorithms match projects with the perfect freelancers based on skills, experience, and
                  availability.
                </CardDescription>
              </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fadeIn" delay={200}>
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Secure Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Protected escrow system ensures safe transactions with milestone-based payments and dispute
                    resolution.
                  </CardDescription>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fadeIn" delay={300}>
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <UserCheck className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Verified Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Authentic feedback system with verified reviews from real projects to help you make informed
                    decisions.
                  </CardDescription>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fadeIn" delay={400}>
              <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Workflow className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Easy Hiring Process</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Streamlined workflow from project posting to completion with built-in communication and project
                  management tools.
                </CardDescription>
              </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="slideUp" delay={0}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground">Get started in three simple steps</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedSection animation="slideUp" delay={100}>
              <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Post Your Project</h3>
              <p className="text-muted-foreground">
                Describe your project requirements, budget, and timeline. Our AI will analyze and categorize your needs.
              </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="slideUp" delay={200}>
              <div className="text-center">
                <div className="bg-secondary text-secondary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Get Matched</h3>
                <p className="text-muted-foreground">
                  Receive proposals from pre-screened freelancers who perfectly match your project requirements and
                  budget.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="slideUp" delay={300}>
              <div className="text-center">
              <div className="bg-accent text-accent-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Complete Securely</h3>
              <p className="text-muted-foreground">
                Work with your chosen freelancer using our secure platform with milestone payments and built-in
                communication tools.
              </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="slideUp" delay={0}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What Our Users Say</h2>
              <p className="text-lg text-muted-foreground">Join thousands of satisfied clients and freelancers</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedSection animation="fadeIn" delay={100}>
              <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "SkillSync's AI matching is incredible. I found the perfect developer for my project within hours, not
                  weeks."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold mr-3">
                    DK
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Deep Kabariya</p>
                    <p className="text-sm text-muted-foreground">Startup Founder</p>
                  </div>
                </div>
              </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fadeIn" delay={200}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "As a freelancer, SkillSync connects me with high-quality projects that match my skills perfectly. The
                    payment system is reliable too."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-semibold mr-3">
                      PD
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Pradip Dangodara</p>
                      <p className="text-sm text-muted-foreground">Full-Stack Developer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fadeIn" delay={300}>
              <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "The secure payment system and verified reviews give me confidence in every transaction. Highly
                  recommended!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-semibold mr-3">
                    GA
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Gajera Akshit</p>
                    <p className="text-sm text-muted-foreground">Marketing Director</p>
                  </div>
                </div>
              </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="slideUp" delay={0}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8">Join thousands of successful projects on SkillSync today</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/post-project">
              <Button size="lg" className="text-lg px-8">
                For Clients
                <Users className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/hire-talent">
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                For Freelancers
                <Zap className="ml-2 h-5 w-5" />
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
