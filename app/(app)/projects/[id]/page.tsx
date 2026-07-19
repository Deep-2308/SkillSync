import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  MapPin,
  Clock,
  Briefcase,
  UserCircle,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle2,
  XOctagon,
  ChevronLeft
} from "lucide-react";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { Project } from "@/models/Project";
import { Proposal } from "@/models/Proposal";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProposalComposer } from "./ProposalComposer";
import { User } from "@/models/User";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProposalActionCard } from "./ProposalActionCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    await connectToDatabase();
    const project = await Project.findById(id).select("title");
    if (!project) return { title: "Project Not Found" };
    return { title: `${project.title} | SkillSync` };
  } catch {
    return { title: "Project Not Found" };
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getAuthSession();
  
  if (!id || id.length !== 24) {
    notFound();
  }

  await connectToDatabase();
  
  const project = await Project.findById(id).populate(
    "postedBy",
    "name image headline location createdAt"
  );

  if (!project) {
    notFound();
  }

  const postedBy = project.postedBy as any;

  const isOwner = postedBy._id.toString() === session.user.id;
  const isFreelancer = session.user.role === "freelancer";
  const isOpen = project.status === "open";

  // Get proposal stats
  const proposalCount = await Proposal.countDocuments({ projectId: id });

  // For the owner, fetch all proposals
  let ownerProposals: any[] = [];
  if (isOwner) {
    const rawProposals = await Proposal.find({ projectId: id })
      .sort({ createdAt: -1 })
      .populate("freelancerId", "name image headline location averageRating")
      .lean();
    
    ownerProposals = rawProposals.map(p => ({
      ...p,
      id: p._id.toString(),
      _id: p._id.toString(),
      freelancerId: {
        ...p.freelancerId,
        id: p.freelancerId?._id?.toString(),
        _id: p.freelancerId?._id?.toString(),
      }
    }));
  }

  // For freelancers, check if they already applied
  let hasApplied = false;
  let freelancerHourlyRate = 0;
  if (isFreelancer) {
    const existing = await Proposal.exists({
      projectId: id,
      freelancerId: session.user.id,
    });
    hasApplied = !!existing;
    
    // Get freelancer's own hourly rate
    const me = await User.findById(session.user.id).select("hourlyRate").lean();
    freelancerHourlyRate = me?.hourlyRate || 0;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-4 h-4" /> Open</span>;
      case "in_progress":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"><Clock className="w-4 h-4" /> In Progress</span>;
      case "completed":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200"><CheckCircle2 className="w-4 h-4" /> Completed</span>;
      case "cancelled":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200"><XOctagon className="w-4 h-4" /> Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Back Link */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground -ml-4">
          <Link href={isOwner ? "/client/projects" : "/search"}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {isOwner ? (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="mb-6 w-full justify-start border-b rounded-none pb-0 h-auto bg-transparent p-0">
                <TabsTrigger 
                  value="details" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:bg-transparent px-4 py-2"
                >
                  Project Details
                </TabsTrigger>
                <TabsTrigger 
                  value="proposals" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:bg-transparent px-4 py-2"
                >
                  Proposals ({proposalCount})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6 mt-0">
                <div className="bg-card rounded-2xl border p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                      {project.title}
                    </h1>
                    <div className="shrink-0">{getStatusBadge(project.status)}</div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Posted {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {postedBy?.location || "Remote"}
                    </span>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <h2 className="text-lg font-bold text-foreground mb-4">Project Description</h2>
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground text-sm sm:text-base leading-relaxed">
                      {project.description.split("\n").map((para: string, i: number) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-2xl border p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-foreground mb-6">Project Details</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-medium">Budget</span>
                      </div>
                      <p className="font-semibold text-foreground">
                        {project.budgetType === "fixed" 
                          ? `$${project.budgetMin} - $${project.budgetMax}` 
                          : `$${project.hourlyRate}/hr`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {project.budgetType === "fixed" ? "Fixed Price" : `~${project.estimatedHours} hrs`}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-sm font-medium">Experience</span>
                      </div>
                      <p className="font-semibold text-foreground capitalize">
                        {project.experienceLevel}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">Timeline</span>
                      </div>
                      <p className="font-semibold text-foreground capitalize">
                        {project.timeline.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <h3 className="font-bold text-foreground mb-3 text-sm">Skills Required</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((skill: string) => (
                        <span key={skill} className="px-3 py-1.5 bg-muted rounded-md text-sm font-medium text-foreground/80">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {project.attachments && project.attachments.length > 0 && (
                  <div className="bg-card rounded-2xl border p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-foreground mb-4">Attachments</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {project.attachments.map((url: string, index: number) => {
                        const filename = url.split("/").pop() || `Attachment ${index + 1}`;
                        return (
                          <a 
                            key={url} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 rounded-xl border hover:border-brand/30 hover:bg-brand/5 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0 text-brand">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{filename}</p>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="proposals" className="space-y-6 mt-0">
                {ownerProposals.length === 0 ? (
                  <div className="p-12 text-center border border-dashed rounded-2xl bg-card">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">No proposals yet</h3>
                    <p className="text-muted-foreground">
                      When freelancers bid on your project, their proposals will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ownerProposals.map((proposal) => (
                      <ProposalActionCard 
                        key={proposal.id} 
                        proposal={proposal} 
                        projectStatus={project.status} 
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-6">
              {/* Fallback layout for non-owners */}
              <div className="bg-card rounded-2xl border p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {project.title}
                  </h1>
                  <div className="shrink-0">{getStatusBadge(project.status)}</div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Posted {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {postedBy?.location || "Remote"}
                  </span>
                </div>

                <div className="pt-6 border-t border-border">
                  <h2 className="text-lg font-bold text-foreground mb-4">Project Description</h2>
                  <div className="prose dark:prose-invert max-w-none text-muted-foreground text-sm sm:text-base leading-relaxed">
                    {project.description.split("\n").map((para: string, i: number) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Details & Skills */}
              <div className="bg-card rounded-2xl border p-6 sm:p-8">
                <h2 className="text-lg font-bold text-foreground mb-6">Project Details</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-medium">Budget</span>
                    </div>
                    <p className="font-semibold text-foreground">
                      {project.budgetType === "fixed" 
                        ? `$${project.budgetMin} - $${project.budgetMax}` 
                        : `$${project.hourlyRate}/hr`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {project.budgetType === "fixed" ? "Fixed Price" : `~${project.estimatedHours} hrs`}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm font-medium">Experience</span>
                    </div>
                    <p className="font-semibold text-foreground capitalize">
                      {project.experienceLevel}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Timeline</span>
                    </div>
                    <p className="font-semibold text-foreground capitalize">
                      {project.timeline.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <h3 className="font-bold text-foreground mb-3 text-sm">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1.5 bg-muted rounded-md text-sm font-medium text-foreground/80">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Attachments */}
              {project.attachments && project.attachments.length > 0 && (
                <div className="bg-card rounded-2xl border p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-foreground mb-4">Attachments</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.attachments.map((url: string, index: number) => {
                      const filename = url.split("/").pop() || `Attachment ${index + 1}`;
                      return (
                        <a 
                          key={url} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 rounded-xl border hover:border-brand/30 hover:bg-brand/5 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0 text-brand">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{filename}</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Action Card */}
          <div className="bg-card rounded-2xl border p-6">
            {isOwner ? (
              <div className="space-y-4">
                <h3 className="font-bold text-lg border-b pb-2">Manage Project</h3>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Proposals</span>
                  <span className="font-bold text-brand bg-brand/10 px-2.5 py-0.5 rounded-full">
                    {proposalCount}
                  </span>
                </div>
                
                {isOpen ? (
                  <div className="space-y-3 pt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/client/projects`}>Back to My Projects</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 bg-muted rounded-lg text-center text-sm text-muted-foreground mt-4">
                    This project is {project.status.replace("_", " ")} and no longer accepting proposals.
                  </div>
                )}
              </div>
            ) : isFreelancer ? (
              <div className="space-y-4">
                {isOpen ? (
                  hasApplied ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                      <p className="font-semibold text-emerald-800">Proposal Submitted</p>
                      <p className="text-xs text-emerald-600 mt-1">You have already applied for this project.</p>
                    </div>
                  ) : (
                    <>
                      <ProposalComposer 
                        projectId={id}
                        budgetType={project.budgetType}
                        budgetMin={project.budgetMin}
                        budgetMax={project.budgetMax}
                        hourlyRate={project.hourlyRate}
                        freelancerHourlyRate={freelancerHourlyRate}
                      />
                    </>
                  )
                ) : (
                  <div className="p-4 bg-muted rounded-xl text-center border">
                    <XOctagon className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                    <p className="font-semibold text-foreground">Project Closed</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This project is no longer accepting new proposals.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <p className="text-sm text-amber-800">
                  You must be a freelancer to submit a proposal.
                </p>
              </div>
            )}
          </div>

          {/* Client Info Card */}
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="font-bold text-foreground mb-4">About the Client</h3>
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={postedBy.image || ""} />
                <AvatarFallback><UserCircle className="w-8 h-8 text-muted-foreground" /></AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{postedBy.name}</p>
                <p className="text-sm text-muted-foreground">{postedBy.location || "Remote"}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium text-foreground">
                  {new Date(postedBy.createdAt).getFullYear()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Open Projects</span>
                <span className="font-medium text-foreground">Active</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
