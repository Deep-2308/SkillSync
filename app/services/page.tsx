import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Code, Palette, PenTool, Megaphone, BarChart, Camera, Brain, Zap, Target, Users } from "lucide-react"
import Link from "next/link"
import { AnimatedSection } from "@/components/animated-section"

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-muted">
        <AnimatedSection animation="fadeIn" delay={0}>
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Our Services
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Find Expert Freelancers in Every Category
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              From web development to digital marketing, discover top-tier talent across all major freelance categories
              with our AI-powered matching system.
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* Freelancer Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="slideUp" delay={0}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Freelancer Categories</h2>
              <p className="text-lg text-muted-foreground">Browse our extensive network of verified professionals</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatedSection animation="fadeIn" delay={100}>
              <Card className="hover:shadow-lg transition-shadow group">
              <CardHeader>
                <Code className="h-10 w-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <CardTitle>Web Development</CardTitle>
                <CardDescription>
                  Full-stack developers, frontend specialists, backend engineers, and mobile app developers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">React</Badge>
                  <Badge variant="outline">Node.js</Badge>
                  <Badge variant="outline">Python</Badge>
                  <Badge variant="outline">Mobile</Badge>
                </div>
                <p className="text-sm text-muted-foreground">1,200+ developers available</p>
              </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fadeIn" delay={150}>
              <Card className="hover:shadow-lg transition-shadow group">
                <CardHeader>
                  <Palette className="h-10 w-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <CardTitle>Design & Creative</CardTitle>
                  <CardDescription>
                    UI/UX designers, graphic designers, brand specialists, and creative directors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">UI/UX</Badge>
                    <Badge variant="outline">Branding</Badge>
                    <Badge variant="outline">Illustration</Badge>
                    <Badge variant="outline">Video</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">800+ designers available</p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fadeIn" delay={200}>
              <Card className="hover:shadow-lg transition-shadow group">
                <CardHeader>
                  <PenTool className="h-10 w-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <CardTitle>Writing & Content</CardTitle>
                  <CardDescription>
                    Content writers, copywriters, technical writers, and content strategists
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">Copywriting</Badge>
                    <Badge variant="outline">SEO</Badge>
                    <Badge variant="outline">Technical</Badge>
                    <Badge variant="outline">Blog</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">600+ writers available</p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fadeIn" delay={250}>
              <Card className="hover:shadow-lg transition-shadow group">
                <CardHeader>
                  <Megaphone className="h-10 w-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <CardTitle>Digital Marketing</CardTitle>
                  <CardDescription>
                    SEO specialists, social media managers, PPC experts, and growth marketers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">SEO</Badge>
                    <Badge variant="outline">Social Media</Badge>
                    <Badge variant="outline">PPC</Badge>
                    <Badge variant="outline">Analytics</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">500+ marketers available</p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fadeIn" delay={300}>
              <Card className="hover:shadow-lg transition-shadow group">
                <CardHeader>
                  <BarChart className="h-10 w-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <CardTitle>Data & Analytics</CardTitle>
                  <CardDescription>
                    Data scientists, analysts, business intelligence experts, and researchers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">Python</Badge>
                    <Badge variant="outline">SQL</Badge>
                    <Badge variant="outline">Tableau</Badge>
                    <Badge variant="outline">ML</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">400+ analysts available</p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fadeIn" delay={350}>
              <Card className="hover:shadow-lg transition-shadow group">
              <CardHeader>
                <Camera className="h-10 w-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <CardTitle>Video & Photography</CardTitle>
                <CardDescription>Video editors, photographers, animators, and multimedia specialists</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">Video Editing</Badge>
                  <Badge variant="outline">Photography</Badge>
                  <Badge variant="outline">Animation</Badge>
                  <Badge variant="outline">3D</Badge>
                </div>
                <p className="text-sm text-muted-foreground">350+ creatives available</p>
              </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* AI Matching Details */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="slideUp" delay={0}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">AI-Powered Skill Matching</h2>
              <p className="text-lg text-muted-foreground">
                Our advanced algorithms ensure perfect project-freelancer matches
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="slideInLeft" delay={100}>
              <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Brain className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Intelligent Analysis</h3>
                    <p className="text-muted-foreground">
                      Our AI analyzes project requirements, complexity, timeline, and budget to understand exactly what
                      you need.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Target className="h-8 w-8 text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Precision Matching</h3>
                    <p className="text-muted-foreground">
                      Match with freelancers based on skills, experience level, past project success, and availability.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Zap className="h-8 w-8 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Instant Results</h3>
                    <p className="text-muted-foreground">
                      Get matched with qualified freelancers within minutes, not days. Start your project faster than
                      ever.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Users className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Quality Assurance</h3>
                    <p className="text-muted-foreground">
                      All matches are verified for quality and compatibility, ensuring successful project outcomes.
                    </p>
                  </div>
                </div>
              </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="slideInRight" delay={200}>
              <Card className="p-8">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl">How Matching Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <p className="text-muted-foreground">Project requirements analyzed by AI</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-secondary text-secondary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <p className="text-muted-foreground">Freelancer database searched for matches</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-accent text-accent-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <p className="text-muted-foreground">Top candidates ranked by compatibility</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-muted-foreground text-background rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <p className="text-muted-foreground">Personalized recommendations delivered</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Ready to Find Your Perfect Match?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start your project today and get matched with top freelancers in minutes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/post-project">
              <Button size="lg" className="text-lg px-8">
                Post a Project
              </Button>
            </Link>
            <Link href="/hire-talent">
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
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
