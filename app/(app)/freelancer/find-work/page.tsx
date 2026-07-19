import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession, parsePagination } from "@/lib/api-utils";
import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { Proposal } from "@/models/Proposal";
import { FindWorkClient } from "./FindWorkClient";

export const metadata: Metadata = {
  title: "Find Work | SkillSync",
};

export const dynamic = "force-dynamic";

export default async function FindWorkPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getAuthSession();
  
  if (session.user.role !== "freelancer") {
    redirect("/dashboard");
  }

  await connectToDatabase();

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const category = typeof params.category === "string" ? params.category : "";
  const budgetType = typeof params.budgetType === "string" ? params.budgetType : "";
  const experienceLevel = typeof params.experienceLevel === "string" ? params.experienceLevel : "";
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const minBudget = parseFloat((params.minBudget as string) ?? "0") || 0;
  const maxBudget = parseFloat((params.maxBudget as string) ?? "0") || 0;
  
  const page = parseInt((params.page as string) ?? "1", 10) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;

  const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const filter: Record<string, unknown> = { status: "open" };

  if (category && category.length > 0) {
    filter.category = { $in: category.split(",") };
  }
  
  if (experienceLevel && experienceLevel !== "Any") {
    filter.experienceLevel = experienceLevel.toLowerCase();
  }
  
  if (budgetType && budgetType !== "Any") {
    filter.budgetType = budgetType.toLowerCase();
  }

  if (minBudget > 0 || maxBudget > 0) {
    if (filter.budgetType === "hourly") {
      if (minBudget > 0) filter.hourlyRate = { ...((filter.hourlyRate as any) || {}), $gte: minBudget };
      if (maxBudget > 0) filter.hourlyRate = { ...((filter.hourlyRate as any) || {}), $lte: maxBudget };
    } else if (filter.budgetType === "fixed") {
      if (minBudget > 0) filter.budgetMax = { ...((filter.budgetMax as any) || {}), $gte: minBudget };
      if (maxBudget > 0) filter.budgetMin = { ...((filter.budgetMin as any) || {}), $lte: maxBudget };
    } else {
      filter.$or = [
        { hourlyRate: { $gte: minBudget || 0, ...(maxBudget > 0 ? { $lte: maxBudget } : {}) } },
        { 
          budgetMax: { $gte: minBudget || 0 },
          ...(maxBudget > 0 ? { budgetMin: { $lte: maxBudget } } : {})
        }
      ];
    }
  }

  if (q) {
    const safeQ = escapeRegExp(q);
    const qRegex = { $regex: safeQ, $options: "i" };
    const textMatch = {
      $or: [
        { title: qRegex },
        { description: qRegex },
        { skills: qRegex },
      ]
    };
    
    if (filter.$or) {
      filter.$and = [ { $or: filter.$or }, textMatch ];
      delete filter.$or;
    } else {
      filter.$or = textMatch.$or;
    }
  }

  let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === "budget") {
    sortObj = { budgetMax: -1, hourlyRate: -1 };
  }

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate("postedBy", "name image headline rating")
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(),
    Project.countDocuments(filter),
  ]);

  // Fetch proposal counts for these projects
  const projectIds = projects.map(p => p._id);
  const proposalCounts = await Proposal.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    { $group: { _id: "$projectId", count: { $sum: 1 } } }
  ]);
  const countMap = new Map(proposalCounts.map(item => [item._id.toString(), item.count]));

  const formattedProjects = projects.map(p => ({
    id: p._id.toString(),
    title: p.title,
    description: p.description,
    budgetType: p.budgetType,
    budgetMin: p.budgetMin,
    budgetMax: p.budgetMax,
    hourlyRate: p.hourlyRate,
    estimatedHours: p.estimatedHours,
    skills: p.skills,
    experienceLevel: p.experienceLevel,
    createdAt: p.createdAt.toISOString(),
    proposalCount: countMap.get(p._id.toString()) || 0,
    client: {
      name: (p.postedBy as any)?.name || "Unknown",
      rating: (p.postedBy as any)?.rating || 0,
    }
  }));

  return (
    <main className="min-h-screen bg-muted/40 pt-20">
      <FindWorkClient 
        projects={formattedProjects} 
        total={total} 
        currentPage={page} 
        totalPages={Math.ceil(total / limit)} 
      />
    </main>
  );
}
