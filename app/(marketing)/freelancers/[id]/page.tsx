import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  Star,
  Clock,
  Briefcase,
  UserCircle,
  MessageSquare,
  Share2,
  ChevronLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Review } from "@/models/Review";
import { auth } from "@/lib/auth";
import { MessageButton } from "@/components/messages/MessageButton";

async function getFreelancer(id: string, viewerId?: string) {
  try {
    await connectToDatabase();
    const user = await User.findById(id);

    if (!user || user.role !== "freelancer") {
      return null;
    }

    // Increment profileViews if viewer is not the owner
    if (viewerId !== id) {
      await User.findByIdAndUpdate(id, { $inc: { profileViews: 1 } });
    }

    // Fetch reviews
    const reviews = await Review.find({ targetId: id })
      .populate("reviewerId", "name image")
      .sort({ createdAt: -1 })
      .limit(10); // get last 10 reviews for now

    // Fetch published gigs
    const { Skill } = await import("@/models/Skill");
    const gigs = await Skill.find({ providerId: id, isPublished: true })
      .sort({ createdAt: -1 })
      .lean();

    return {
      user: JSON.parse(JSON.stringify(user)),
      reviews: JSON.parse(JSON.stringify(reviews)),
      gigs: JSON.parse(JSON.stringify(gigs)),
    };
  } catch (err) {
    console.error("[getFreelancer] error", err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    await connectToDatabase();
    const user = await User.findById(resolvedParams.id).select("name headline location");
    if (!user) return { title: "Freelancer Not Found | SkillSync" };

    return {
      title: `${user.name} ${user.headline ? `- ${user.headline}` : ""} | SkillSync`,
      description: `Hire ${user.name} on SkillSync.`,
    };
  } catch (err) {
    return { title: "Freelancer Not Found | SkillSync" };
  }
}

export default async function FreelancerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const viewerId = session?.user?.id;

  const resolvedParams = await params;
  
  // Wait, if it's an invalid ObjectId, mongoose throws CastError
  if (!resolvedParams.id || resolvedParams.id.length !== 24) {
    notFound();
  }

  const data = await getFreelancer(resolvedParams.id, viewerId);

  if (!data) {
    notFound();
  }

  const { user, reviews, gigs } = data;
  const rating = user.averageRating || 0;
  const reviewCount = user.reviewCount || 0;

  return (
    <div className="min-h-screen bg-muted/40 pt-24 pb-20">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        
        {/* Breadcrumb / Back */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/search">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Search
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Card */}
            <div className="bg-card rounded-2xl border p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-muted border flex items-center justify-center overflow-hidden shadow-md">
                    {user.image ? (
                      <Image src={user.image} alt={user.name} width={128} height={128} className="object-cover w-full h-full" />
                    ) : (
                      <UserCircle className="w-16 h-16 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                        {user.name}
                      </h1>
                      <p className="text-lg text-muted-foreground mt-1">
                        {user.headline || "Freelancer"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="rounded-full">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {user.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {user.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
                      ({reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio section */}
            {user.bio && (
              <div className="bg-card rounded-2xl border p-6 sm:p-8 space-y-4">
                <h2 className="text-xl font-bold text-foreground">About Me</h2>
                <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                  {user.bio.split('\n').map((paragraph: string, index: number) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-card rounded-2xl border p-6 sm:p-8 space-y-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                Reviews 
                <span className="text-muted-foreground text-sm font-normal">({reviewCount})</span>
              </h2>
              
              {reviews.length === 0 ? (
                <div className="text-center py-8 border rounded-xl bg-muted/30">
                  <Star className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <p className="text-muted-foreground">No reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review: any) => (
                    <div key={review._id} className="border-b last:border-0 pb-6 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                            {review.reviewerId?.image ? (
                              <Image src={review.reviewerId.image} alt="Reviewer" width={40} height={40} className="object-cover w-full h-full" />
                            ) : (
                              <UserCircle className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{review.reviewerId?.name || "Anonymous Client"}</p>
                            <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2 py-1 rounded-md text-sm font-medium">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {review.rating}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mt-3">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Gigs Section */}
            {gigs && gigs.length > 0 && (
              <div className="bg-card rounded-2xl border p-6 sm:p-8 space-y-6 mt-6">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  Gigs by {user.name.split(" ")[0]}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gigs.map((gig: any) => (
                    <Link key={gig._id} href={`/gigs/${gig.slug}`} className="group bg-muted/40 rounded-xl border p-4 hover:border-brand/30 hover:shadow-sm transition-all flex flex-col h-full">
                      <h3 className="font-bold text-foreground text-sm line-clamp-2 mb-2 group-hover:text-brand transition-colors">
                        {gig.title}
                      </h3>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs font-medium">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          {gig.rating.toFixed(1)} <span className="text-muted-foreground font-normal">({gig.reviewCount})</span>
                        </span>
                        <span className="font-bold text-foreground text-sm">
                          <span className="text-[10px] text-muted-foreground font-normal mr-1">From</span>
                          ${gig.hourlyRate}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            
            {/* Action Card */}
            <div className="bg-card rounded-2xl border p-6">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-1">Hourly Rate</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-foreground">
                    {user.hourlyRate ? `$${user.hourlyRate}` : "Negotiable"}
                  </span>
                  {user.hourlyRate && <span className="text-muted-foreground mb-1">/hr</span>}
                </div>
              </div>
              
              <div className="space-y-3">
                <Button className="w-full h-12 text-base">Hire {user.name.split(' ')[0]}</Button>
                <MessageButton 
                  participantId={user._id.toString()} 
                  variant="outline" 
                  className="w-full h-12 text-base" 
                />
              </div>

              <div className="mt-6 pt-6 border-t border-border space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Availability
                  </span>
                  <span className="font-medium text-foreground">Available Now</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Member Since
                  </span>
                  <span className="font-medium text-foreground">
                    {new Date(user.createdAt).getFullYear()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <UserCircle className="w-4 h-4" /> Profile Views
                  </span>
                  <span className="font-medium text-foreground">{user.profileViews || 0}</span>
                </div>
              </div>
            </div>

            {/* Skills Card */}
            {user.skills && user.skills.length > 0 && (
              <div className="bg-card rounded-2xl border p-6">
                <h3 className="font-bold text-foreground mb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill: string) => (
                    <span 
                      key={skill}
                      className="px-3 py-1.5 bg-muted rounded-md text-sm font-medium text-foreground/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
