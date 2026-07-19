import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { Project } from "@/models/Project";
import { Proposal } from "@/models/Proposal";
import { ClientProjectList } from "./ClientProjectList";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My Projects | SkillSync",
};

export default async function ClientProjectsPage() {
  const session = await getAuthSession();

  if (session.user.role !== "client") {
    redirect("/dashboard");
  }

  await connectToDatabase();

  const projects = await Project.find({ postedBy: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  const projectIds = projects.map(p => p._id);

  // Use aggregation to count proposals per project efficiently
  const proposalCounts = await Proposal.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    { $group: { _id: "$projectId", count: { $sum: 1 } } }
  ]);

  const countMap = new Map(proposalCounts.map(item => [item._id.toString(), item.count]));

  const formattedProjects = projects.map(p => ({
    _id: p._id.toString(),
    title: p.title,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    proposalCount: countMap.get(p._id.toString()) || 0
  }));

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your job postings and review proposals.</p>
        </div>
        <Button asChild>
          <Link href="/post-project">
            <PlusCircle className="w-4 h-4 mr-2" /> Post a Project
          </Link>
        </Button>
      </div>

      <ClientProjectList initialProjects={formattedProjects} />
    </div>
  );
}
