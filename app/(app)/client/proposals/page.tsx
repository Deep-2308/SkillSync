import { Metadata } from "next";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { Proposal } from "@/models/Proposal";
import mongoose from "mongoose";

export const metadata: Metadata = {
  title: "Received Proposals | SkillSync",
};

export default async function ClientProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getAuthSession();
  const { status } = await searchParams;
  
  if (session.user.role !== "client") {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">Only clients can view received proposals.</p>
      </div>
    );
  }

  await connectToDatabase();
  const userId = new mongoose.Types.ObjectId(session.user.id);

  const matchQuery: any = {
    "project.postedBy": userId,
  };

  if (status && ["pending", "accepted", "rejected", "withdrawn"].includes(status)) {
    matchQuery.status = status;
  }

  // Fetch all proposals and group them manually for ease of rendering
  const pipeline = [
    {
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "_id",
        as: "project",
      },
    },
    { $unwind: "$project" },
    { $match: matchQuery },
    {
      $lookup: {
        from: "users",
        localField: "freelancerId",
        foreignField: "_id",
        as: "freelancer",
        pipeline: [
          { $project: { name: 1, image: 1, headline: 1, location: 1, averageRating: 1 } },
        ],
      },
    },
    { $unwind: { path: "$freelancer", preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 as const } },
  ];

  const rawProposals = await Proposal.aggregate(pipeline);

  const proposalsByProject = rawProposals.reduce((acc, proposal) => {
    const projectId = proposal.project._id.toString();
    if (!acc[projectId]) {
      acc[projectId] = {
        project: {
          id: projectId,
          title: proposal.project.title,
          status: proposal.project.status,
        },
        proposals: [],
      };
    }
    acc[projectId].proposals.push({
      ...proposal,
      id: proposal._id.toString(),
      freelancer: {
        ...proposal.freelancer,
        id: proposal.freelancer?._id?.toString(),
      }
    });
    return acc;
  }, {} as Record<string, { project: any; proposals: any[] }>);

  const groupedProposals = Object.values(proposalsByProject) as Array<{ project: any; proposals: any[] }>;
  const totalProposals = rawProposals.length;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Proposals Received</h1>
          <p className="text-muted-foreground mt-1">
            Review incoming bids from freelancers across all your projects.
          </p>
        </div>
        
        {/* Simple Status Filter */}
        <div className="flex gap-2">
          <Button variant={!status ? "default" : "outline"} asChild size="sm">
            <Link href="/client/proposals">All ({!status ? totalProposals : "..."})</Link>
          </Button>
          <Button variant={status === "pending" ? "default" : "outline"} asChild size="sm">
            <Link href="/client/proposals?status=pending">Pending</Link>
          </Button>
          <Button variant={status === "accepted" ? "default" : "outline"} asChild size="sm">
            <Link href="/client/proposals?status=accepted">Accepted</Link>
          </Button>
        </div>
      </div>

      {groupedProposals.length === 0 ? (
        <div className="text-center py-20 px-4 bg-card rounded-2xl border border-dashed">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No proposals found</h3>
          <p className="text-muted-foreground mb-6">
            {status ? `You don't have any ${status} proposals right now.` : "No one has submitted a proposal to your projects yet."}
          </p>
          {status && (
            <Button variant="outline" asChild>
              <Link href="/client/proposals">Clear Filters</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {groupedProposals.map(({ project, proposals }) => (
            <div key={project.id} className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    <Link href={`/projects/${project.id}`} className="hover:underline hover:text-brand transition-colors">
                      {project.title}
                    </Link>
                  </h2>
                  {project.status !== "open" && (
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                      Project is {project.status.replace("_", " ")}
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {proposals.length} Bid{proposals.length !== 1 && "s"}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {proposals.map((proposal: any) => (
                  <Link 
                    key={proposal.id} 
                    href={`/projects/${project.id}?tab=proposals`}
                    className="bg-card border rounded-xl p-5 hover:border-brand/40 hover:shadow-sm transition-all group block"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        {proposal.freelancer?.image ? (
                          <img src={proposal.freelancer.image} alt={proposal.freelancer.name} className="w-10 h-10 rounded-full border" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold border">
                            {proposal.freelancer?.name?.[0] || "?"}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-brand transition-colors">{proposal.freelancer?.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{proposal.freelancer?.headline || "Freelancer"}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-foreground">${proposal.proposedRate}</p>
                        <p className="text-xs text-muted-foreground">{proposal.timeline.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 bg-muted/30 p-2 rounded-lg border border-dashed">
                      {proposal.message}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
                      </span>
                      {proposal.status === "pending" && (
                        <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">Pending</span>
                      )}
                      {proposal.status === "accepted" && (
                        <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Accepted</span>
                      )}
                      {proposal.status === "rejected" && (
                        <span className="text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">Rejected</span>
                      )}
                      {proposal.status === "withdrawn" && (
                        <span className="text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">Withdrawn</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
