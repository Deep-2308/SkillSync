import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Users, Shield, Award, CheckCircle, TrendingUp } from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-muted">
        <AnimatedSection animation="fadeIn" delay={0}>
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              About SkillSync
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Revolutionizing Freelance Collaboration
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              We're building the future of work by connecting talented freelancers with visionary clients through
              intelligent matching and secure collaboration tools.
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="slideInLeft" delay={0}>
              <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6 text-pretty">
                At SkillSync, we believe that great work happens when the right people connect. Our mission is to
                eliminate the friction in freelance hiring by using advanced AI to match projects with perfectly suited
                talent.
              </p>
              <p className="text-lg text-muted-foreground text-pretty">
                We're not just another freelance platform – we're a technology company focused on creating meaningful
                connections that drive successful outcomes for both clients and freelancers.
              </p>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="slideInRight" delay={100}>
              <div className="grid grid-cols-2 gap-4">
                <AnimatedSection animation="fadeIn" delay={200}>
                  <Card className="text-center">
                <CardContent className="pt-6">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">50K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </CardContent>
                  </Card>
                </AnimatedSection>
                <AnimatedSection animation="fadeIn" delay={300}>
                  <Card className="text-center">
                    <CardContent className="pt-6">
                      <CheckCircle className="h-8 w-8 text-secondary mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">25K+</div>
                      <div className="text-sm text-muted-foreground">Projects Completed</div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
                <AnimatedSection animation="fadeIn" delay={400}>
                  <Card className="text-center">
                    <CardContent className="pt-6">
                      <Award className="h-8 w-8 text-accent mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">4.9/5</div>
                      <div className="text-sm text-muted-foreground">Average Rating</div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
                <AnimatedSection animation="fadeIn" delay={500}>
                  <Card className="text-center">
                <CardContent className="pt-6">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">98%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </CardContent>
                  </Card>
                </AnimatedSection>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="slideUp" delay={0}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why SkillSync Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform is built on three core principles that ensure success for everyone
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedSection animation="fadeIn" delay={100}>
              <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Precision Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-left">
                  Our AI analyzes project requirements, freelancer skills, past performance, and availability to create
                  perfect matches. No more sifting through hundreds of irrelevant proposals.
                </CardDescription>
              </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fadeIn" delay={200}>
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Shield className="h-12 w-12 text-secondary mx-auto mb-4" />
                  <CardTitle>Trust & Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-left">
                    Every freelancer is verified, all payments are secured through escrow, and our review system ensures
                    transparency. Work with confidence knowing you're protected.
                  </CardDescription>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fadeIn" delay={300}>
              <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-accent mx-auto mb-4" />
                <CardTitle>Community Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-left">
                  We foster long-term relationships between clients and freelancers. Our platform rewards quality work
                  and builds lasting professional connections.
                </CardDescription>
              </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Trust Factor Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="slideUp" delay={0}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Built for Trust</h2>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              Trust is the foundation of every successful project. That's why we've built comprehensive systems to protect
              both clients and freelancers throughout their collaboration.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-secondary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Identity Verification</h3>
                <p className="text-muted-foreground">
                  All users undergo thorough identity verification before joining the platform.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-secondary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Secure Payments</h3>
                <p className="text-muted-foreground">
                  Escrow system protects funds until project milestones are completed.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-secondary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Dispute Resolution</h3>
                <p className="text-muted-foreground">
                  Professional mediation team helps resolve any project conflicts fairly.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-secondary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Quality Assurance</h3>
                <p className="text-muted-foreground">
                  Continuous monitoring and feedback systems maintain high standards.
                </p>
              </div>
            </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      <Footer />
    </div>
  )
}
