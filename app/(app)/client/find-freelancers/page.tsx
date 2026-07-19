import { Metadata } from "next";
import { redirect } from "next/navigation";
import type { PipelineStage } from "mongoose";
import { getAuthSession } from "@/lib/api-utils";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { HireTalentClient } from "./HireTalentClient";

export const metadata: Metadata = {
  title: "Hire Talent | SkillSync",
};

export const dynamic = "force-dynamic";

export default async function HireTalentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getAuthSession();
  
  if (session.user.role !== "client" && session.user.role !== "admin") {
    redirect("/dashboard");
  }

  await connectToDatabase();

  const params = await searchParams;
  const q = typeof params.search === "string" ? params.search.trim() : "";
  const category = typeof params.category === "string" ? params.category : "";
  const minRate = parseFloat((params.minRate as string) ?? "0") || 0;
  const maxRate = parseFloat((params.maxRate as string) ?? "0") || 0;
  const minRating = parseFloat((params.rating as string) ?? "0") || 0;
  const availableNow = params.available === "true";
  const sort = typeof params.sort === "string" ? params.sort : "best_match";
  
  const page = parseInt((params.page as string) ?? "1", 10) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;

  // Base match: only providers
  const matchStage: Record<string, unknown> = { role: "freelancer" };

  if (q) {
    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safeQ = escapeRegExp(q);
    matchStage.$or = [
      { name: { $regex: safeQ, $options: "i" } },
      { skills: { $regex: safeQ, $options: "i" } },
      { headline: { $regex: safeQ, $options: "i" } },
    ];
  }

  const pipeline: PipelineStage[] = [
    { $match: matchStage },
    {
      $lookup: {
        from: "skills",
        localField: "_id",
        foreignField: "providerId",
        as: "skillListings",
      },
    },
    {
      $addFields: {
        averageRate: {
          $cond: [
            { $gt: [{ $size: "$skillListings" }, 0] },
            { $avg: "$skillListings.hourlyRate" },
            0,
          ],
        },
        averageRating: {
          $cond: [
            { $gt: [{ $size: "$skillListings" }, 0] },
            { $avg: "$skillListings.rating" },
            0,
          ],
        },
        totalReviews: {
          $sum: "$skillListings.reviewCount",
        },
        categories: {
          $setUnion: "$skillListings.category",
        },
      },
    },
  ];

  const postMatchStage: Record<string, unknown> = {};

  if (category) {
    postMatchStage.categories = { $in: category.split(",") };
  }

  if (minRate > 0) {
    postMatchStage.averageRate = { ...((postMatchStage.averageRate as Record<string, unknown>) ?? {}), $gte: minRate };
  }
  if (maxRate > 0) {
    postMatchStage.averageRate = { ...((postMatchStage.averageRate as Record<string, unknown>) ?? {}), $lte: maxRate };
  }

  if (minRating > 0) {
    postMatchStage.averageRating = { $gte: minRating };
  }
  
  if (availableNow) {
    postMatchStage.isOnline = true; // Assumes User model has isOnline or we use it as a proxy. If not available, skip it.
  }

  if (Object.keys(postMatchStage).length > 0) {
    pipeline.push({ $match: postMatchStage });
  }

  // Sort
  const sortStageMap: Record<string, Record<string, 1 | -1>> = {
    highest_rated: { averageRating: -1 },
    most_reviews: { totalReviews: -1 },
    lowest_rate: { averageRate: 1 },
    best_match: { createdAt: -1 },
  };
  pipeline.push({ $sort: sortStageMap[sort] ?? { createdAt: -1 } });

  pipeline.push({
    $facet: {
      metadata: [{ $count: "total" }],
      data: [{ $skip: skip }, { $limit: limit }],
    },
  });

  const [result] = await User.aggregate(pipeline);

  const total = result.metadata[0]?.total ?? 0;
  
  const freelancers = result.data.map((doc: any) => ({
    id: doc._id?.toString(),
    name: doc.name || "Unknown",
    title: doc.headline || "Freelancer",
    location: doc.location || "Remote",
    rate: doc.averageRate || 0,
    rating: doc.averageRating || 0,
    reviewCount: doc.totalReviews || 0,
    skills: doc.skills || [],
    isOnline: !!doc.isOnline, // Adjust based on your schema
    avatarUrl: doc.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name || "F")}&background=random`,
  }));

  return (
    <main className="min-h-screen bg-muted/40 pt-20">
      <HireTalentClient 
        freelancers={freelancers} 
        total={total}
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
      />
    </main>
  );
}
