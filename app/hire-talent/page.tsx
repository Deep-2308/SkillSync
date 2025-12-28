import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Star, MapPin, Zap } from "lucide-react"
import { MOCK_FREELANCERS } from "@/lib/constants"
import { AnimatedSection } from "@/components/animated-section"

export default function HireTalentPage() {
  const freelancers = MOCK_FREELANCERS

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="slideUp" delay={0}>
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold mb-4">Find Your Perfect Match</h1>
              <p className="text-muted-foreground text-lg">
                Browse through our network of top-tier freelancers, verified by AI and reviewed by clients.
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search skills, roles..." className="pl-9" />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {freelancers.map((talent, index) => (
            <AnimatedSection key={talent.id} animation="fadeIn" delay={100 + index * 50}>
              <Card
                key={talent.id}
                className="group hover:border-primary transition-colors overflow-hidden flex flex-col"
              >
                <CardHeader className="p-0 border-b relative h-48 bg-muted">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={talent.image_url || "/placeholder.svg"} className="object-cover" />
                    <AvatarFallback className="rounded-none">{talent.name[0]}</AvatarFallback>
                  </Avatar>
                  <Badge className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90 border-none">
                    <Zap className="h-3 w-3 mr-1 text-primary fill-primary" />
                  </Badge>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg leading-none mb-1 group-hover:text-primary transition-colors">
                        {talent.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{talent.role}</p>
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      {talent.rating}
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-muted-foreground mb-4">
                    <MapPin className="h-3 w-3 mr-1" />
                    {talent.location}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {talent.skills.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-muted text-[10px] font-semibold uppercase text-black"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 border-t flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-bold text-foreground">{talent.review_count}</span> reviews
                    </div>
                    <Button size="sm" className="font-bold">
                      Hire
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection animation="slideUp" delay={400}>
          <div className="mt-16 bg-muted p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-lg">
            <h2 className="text-2xl font-bold mb-2">Can't find what you're looking for?</h2>
            <p className="text-muted-foreground">
              Let our AI matching engine find the perfect freelancers for your specific project requirements.
            </p>
          </div>
          <Button size="lg" className="px-8 font-bold text-lg">
            Post a Project
          </Button>
          </div>
        </AnimatedSection>
      </main>

      <Footer />
    </div>
  )
}
