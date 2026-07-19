import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/api-utils";
import { GigsClient } from "./GigsClient";

export const metadata: Metadata = {
  title: "My Gigs | SkillSync",
};

export const dynamic = "force-dynamic";

export default async function FreelancerGigsPage() {
  const session = await getAuthSession();
  
  if (session.user.role !== "freelancer") {
    redirect("/dashboard");
  }

  // Fetch from the DB directly to save an internal network hop
  const { connectToDatabase } = await import("@/lib/mongodb");
  const { Skill } = await import("@/models/Skill");
  
  await connectToDatabase();
  
  const skills = await Skill.find({ providerId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  const formattedGigs = skills.map((s) => ({
    id: s._id.toString(),
    title: s.title,
    slug: s.slug,
    category: s.category,
    level: s.level,
    hourlyRate: s.hourlyRate,
    isPublished: s.isPublished,
    rating: s.rating,
    reviewCount: s.reviewCount,
    deliveryTime: s.deliveryTime || "",
    revisions: s.revisions || 0,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-muted/40 pt-20">
      <GigsClient initialGigs={formattedGigs} />
    </main>
  );
}
