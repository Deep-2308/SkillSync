import Link from "next/link";
import {
  Code,
  Palette,
  LineChart,
  Smartphone,
  PenTool,
  Video,
  Search,
  BrainCircuit,
  MessageSquare,
  Cloud,
  Briefcase,
  Figma,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/animated-section";

// Display metadata for the canonical taxonomy (data/categories.ts). Counts are
// illustrative until real listing counts are wired up.
const categories = [
  { name: "Web Development", icon: Code, count: 1245 },
  { name: "Mobile Development", icon: Smartphone, count: 654 },
  { name: "UI/UX Design", icon: Figma, count: 856 },
  { name: "Graphic Design", icon: Palette, count: 712 },
  { name: "Content Writing", icon: PenTool, count: 1102 },
  { name: "Digital Marketing", icon: LineChart, count: 923 },
  { name: "Video & Animation", icon: Video, count: 543 },
  { name: "Data & AI", icon: BrainCircuit, count: 432 },
  { name: "DevOps & Cloud", icon: Cloud, count: 389 },
  { name: "Business & Consulting", icon: Briefcase, count: 476 },
];

const popularSkills = [
  "React", "Node.js", "Figma", "Python", "SEO", "Copywriting", "Swift", "Logo Design", "Machine Learning", "WordPress", "Data Entry", "Voice Over"
];

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-muted/40 overflow-hidden relative">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -z-10" />
        
        <div className="container mx-auto text-center max-w-3xl">
          <AnimatedSection>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              Find the Right Skill for Your Project
            </h1>
            <p className="text-xl text-muted-foreground mb-10">
              Explore thousands of freelancers across hundreds of categories, ready to help you bring your ideas to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/hire-talent">Browse Talent</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/signup">Become a Freelancer</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 px-6 bg-card">
        <div className="container mx-auto">
          <AnimatedSection>
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-4 text-foreground">Explore Categories</h2>
                <p className="text-muted-foreground">Discover top talent by category</p>
              </div>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <AnimatedSection key={category.name} delay={index * 0.1}>
                  <Link 
                    href={`/hire-talent?category=${encodeURIComponent(category.name)}`}
                    className="group flex flex-col p-6 rounded-2xl border bg-white dark:bg-zinc-950 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Icon className="w-10 h-10 text-brand mb-6 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">{category.name}</h3>
                    <p className="text-muted-foreground text-sm flex items-center justify-between">
                      {category.count} freelancers
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </p>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Matching Explainer */}
      <section className="py-24 px-6 bg-muted/40">
        <div className="container mx-auto">
          <AnimatedSection>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4 text-foreground">How AI Matching Works</h2>
              <p className="text-muted-foreground">
                Finding the perfect freelancer shouldn&apos;t take days. Our AI analyzes your project needs and instantly connects you with the right talent.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
            <div className="hidden md:block absolute top-24 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0" />
            
            {[
              { 
                icon: Search, 
                title: "1. Tell us what you need", 
                desc: "Describe your project, budget, and timeline in simple words." 
              },
              { 
                icon: BrainCircuit, 
                title: "2. AI analyzes & matches", 
                desc: "Our algorithm scans thousands of profiles to find your perfect match." 
              },
              { 
                icon: MessageSquare, 
                title: "3. Connect & start", 
                desc: "Review proposals, chat with freelancers, and kick off your project." 
              }
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <AnimatedSection key={step.title} delay={index * 0.2}>
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-card shadow-md flex items-center justify-center mb-6 border">
                      <Icon className="w-8 h-8 text-brand" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Skills Tag Cloud */}
      <section className="py-24 px-6 bg-card border-t border-border">
        <div className="container mx-auto text-center max-w-4xl">
          <AnimatedSection>
            <h2 className="text-2xl font-bold mb-8 text-foreground">Popular Skills on SkillSync</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {popularSkills.map((skill) => (
                <Link 
                  key={skill} 
                  href={`/hire-talent?skill=${encodeURIComponent(skill)}`}
                  className="px-4 py-2 rounded-full border bg-muted/40 text-foreground/80 hover:border-indigo-500 hover:text-brand transition-colors"
                >
                  {skill}
                </Link>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-brand dark:bg-indigo-900">
        <div className="container mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to bring your ideas to life?
            </h2>
            <p className="text-indigo-100 mb-10 max-w-2xl mx-auto text-lg">
              Join thousands of businesses and individuals who have found their perfect freelancer on SkillSync.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-indigo-900 hover:bg-zinc-100" asChild>
              <Link href="/hire-talent">Start Hiring Now</Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
