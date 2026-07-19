import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  MapPin,
  Clock,
  RotateCcw,
  CheckCircle2,
  UserCircle,
  MessageSquare,
  ChevronLeft
} from "lucide-react";

import { connectToDatabase } from "@/lib/mongodb";
import { Skill } from "@/models/Skill";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    await connectToDatabase();
    const gig = await Skill.findOne({ slug, isPublished: true }).select("title");
    if (!gig) return { title: "Gig Not Found | SkillSync" };
    return { title: `${gig.title} | SkillSync` };
  } catch {
    return { title: "Gig Not Found | SkillSync" };
  }
}

export default async function GigDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  await connectToDatabase();
  
  // Fetch the gig and its owner
  const gig = await Skill.findOne({ slug, isPublished: true }).populate(
    "providerId",
    "name image headline location averageRating reviewCount"
  );

  if (!gig) {
    notFound();
  }

  const provider = gig.providerId as any;

  // Fetch similar gigs (same category, excluding this one)
  const similarGigs = await Skill.find({
    category: gig.category,
    _id: { $ne: gig._id },
    isPublished: true,
  })
    .populate("providerId", "name image")
    .sort({ rating: -1, reviewCount: -1 })
    .limit(3)
    .lean();

  return (
    <div className="min-h-screen bg-muted/30 pt-24 pb-20">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Breadcrumb / Back */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/search" className="hover:text-foreground hover:underline">
            Search
          </Link>
          <span>/</span>
          <Link href={`/search?category=${encodeURIComponent(gig.category)}`} className="hover:text-foreground hover:underline">
            {gig.category}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-card rounded-2xl border p-6 sm:p-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
                {gig.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b pb-6 mb-6">
                <span className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={provider.image} />
                    <AvatarFallback><UserCircle className="w-6 h-6" /></AvatarFallback>
                  </Avatar>
                  <Link href={`/freelancers/${provider._id}`} className="font-medium text-foreground hover:underline">
                    {provider.name}
                  </Link>
                </span>
                
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-medium text-foreground">{gig.rating.toFixed(1)}</span>
                  ({gig.reviewCount} reviews)
                </span>
              </div>

              <h2 className="text-xl font-bold text-foreground mb-4">About This Gig</h2>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                {gig.description.split('\n').map((paragraph: string, index: number) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {gig.tags && gig.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-semibold text-foreground mb-3 text-sm">Relevant Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {gig.tags.map((tag: string) => (
                      <span key={tag} className="px-3 py-1.5 bg-muted rounded-md text-sm font-medium text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            
            {/* Action / Pricing Card */}
            <div className="bg-card rounded-2xl border overflow-hidden sticky top-24">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Standard</h3>
                  <div className="text-2xl font-bold text-foreground">${gig.hourlyRate}</div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-6">
                  Expert-level service delivered directly by {provider.name.split(' ')[0]}.
                </p>

                <div className="space-y-3 mb-6 text-sm font-medium text-foreground">
                  {gig.deliveryTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {gig.deliveryTime} Delivery
                    </div>
                  )}
                  {gig.revisions !== undefined && (
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-muted-foreground" />
                      {gig.revisions === 0 ? "No" : gig.revisions} Revisions
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    High-quality delivery
                  </div>
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-full">
                        <Button className="w-full h-12 text-base" disabled>
                          <MessageSquare className="w-4 h-4 mr-2" /> Contact Freelancer
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-sm">
                      <p>Messaging coming soon in Phase 5</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="mt-6 pt-6 border-t text-center">
                  <Link href={`/freelancers/${provider._id}`} className="text-sm text-brand font-medium hover:underline">
                    View Full Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Provider Mini Card */}
            <div className="bg-card rounded-2xl border p-6">
              <h3 className="font-bold text-foreground mb-4">About the Freelancer</h3>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={provider.image} />
                  <AvatarFallback><UserCircle className="w-8 h-8" /></AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/freelancers/${provider._id}`} className="font-bold text-foreground hover:underline">
                    {provider.name}
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-1">{provider.headline || "Freelancer"}</p>
                </div>
              </div>
              
              {provider.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" /> {provider.location}
                </div>
              )}

              <Button variant="outline" className="w-full" asChild>
                <Link href={`/freelancers/${provider._id}`}>View Profile</Link>
              </Button>
            </div>
            
          </div>
        </div>

        {/* Similar Gigs */}
        {similarGigs.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Similar Gigs you might like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarGigs.map((g: any) => (
                <Link key={g._id} href={`/gigs/${g.slug}`} className="group bg-card rounded-2xl border p-5 hover:border-brand/30 hover:shadow-md transition-all flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={g.providerId?.image} />
                      <AvatarFallback><UserCircle className="w-5 h-5" /></AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {g.providerId?.name}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-lg line-clamp-2 mb-3 group-hover:text-brand transition-colors">
                    {g.title}
                  </h3>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {g.rating.toFixed(1)} <span className="text-muted-foreground font-normal">({g.reviewCount})</span>
                    </span>
                    <span className="font-bold text-foreground">
                      <span className="text-xs text-muted-foreground font-normal mr-1">From</span>
                      ${g.hourlyRate}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
