import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Star,
  Clock,
  Briefcase,
  Globe,
  Award,
  CheckCircle2,
  MessageSquare,
  Share2,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock data fetching function
async function getFreelancer(id: string) {
  // In a real app, this would be a DB query.
  // We'll mock it based on the ID.
  if (id === "not-found") return null;

  return {
    id,
    name: "Alex Morgan",
    title: "Senior Full Stack React Developer",
    avatar: "AM",
    location: "San Francisco, CA (PST)",
    rating: 4.9,
    reviews: 124,
    hourlyRate: 85,
    isOnline: true,
    memberSince: "2023",
    successRate: 98,
    bio: "I'm a senior full-stack developer specializing in React, Next.js, and Node.js ecosystems. With over 8 years of experience building scalable web applications for startups and enterprise clients, I bring a product-focused approach to engineering.\n\nMy core expertise lies in architecting frontend applications with modern React patterns, implementing robust state management, and ensuring pixel-perfect responsive designs. On the backend, I design RESTful and GraphQL APIs that are performant and secure.\n\nI'm passionate about writing clean, maintainable code and mentoring junior developers.",
    skills: [
      { name: "React / Next.js", level: 95 },
      { name: "TypeScript", level: 90 },
      { name: "Node.js", level: 85 },
      { name: "Tailwind CSS", level: 95 },
      { name: "PostgreSQL", level: 80 },
      { name: "GraphQL", level: 75 },
    ],
    languages: ["English (Native)", "Spanish (Conversational)"],
    portfolio: [
      { title: "E-commerce Dashboard", url: "https://example.com/project1" },
      { title: "SaaS Analytics Tool", url: "https://example.com/project2" },
      { title: "Real-estate Platform", url: "https://example.com/project3" },
    ]
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const freelancer = await getFreelancer(resolvedParams.id);
  
  if (!freelancer) {
    return {
      title: "Freelancer Not Found | SkillSync",
    };
  }

  return {
    title: `${freelancer.name} - ${freelancer.title} | SkillSync`,
    description: `Hire ${freelancer.name}, a ${freelancer.title} from ${freelancer.location}. View portfolio, skills, and reviews on SkillSync.`,
  };
}

export default async function FreelancerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const freelancer = await getFreelancer(resolvedParams.id);

  if (!freelancer) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 pb-20">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        
        {/* Breadcrumb / Back */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            <Link href="/hire-talent">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Search
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-md">
                    {freelancer.avatar}
                  </div>
                  {freelancer.isOnline && (
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                        {freelancer.name}
                      </h1>
                      <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-1">
                        {freelancer.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="rounded-full">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="rounded-full">
                        <Star className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {freelancer.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">{freelancer.rating}</span>
                      ({freelancer.reviews} reviews)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      {freelancer.successRate}% Job Success
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio section */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">About Me</h2>
              <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400">
                {freelancer.bio.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Portfolio Links */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Portfolio</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {freelancer.portfolio.map((item, i) => (
                  <a 
                    key={i} 
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{item.title}</p>
                      <p className="text-xs text-zinc-500 truncate">{item.url.replace(/^https?:\/\//, '')}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            
            {/* Action Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="mb-6">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Hourly Rate</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">${freelancer.hourlyRate}</span>
                  <span className="text-zinc-500 dark:text-zinc-400 mb-1">/hr</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button className="w-full h-12 text-base">Hire {freelancer.name.split(' ')[0]}</Button>
                <Button variant="outline" className="w-full h-12 text-base">
                  <MessageSquare className="w-4 h-4 mr-2" /> Message
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Availability
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">Available Now</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Member Since
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{freelancer.memberSince}</span>
                </div>
              </div>
            </div>

            {/* Skills Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50 mb-4">Skills & Expertise</h3>
              <div className="space-y-4">
                {freelancer.skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{skill.name}</span>
                      <span className="text-zinc-500">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50 mb-3">Languages</h3>
              <div className="space-y-2">
                {freelancer.languages.map((lang) => (
                  <div key={lang} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {lang}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
