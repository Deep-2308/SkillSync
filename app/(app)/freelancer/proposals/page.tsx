import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/api-utils";
import { ProposalsClient } from "./ProposalsClient";

export const metadata: Metadata = {
  title: "My Proposals | SkillSync",
};

export const dynamic = "force-dynamic";

export default async function FreelancerProposalsPage() {
  const session = await getAuthSession();
  
  if (session.user.role !== "freelancer") {
    redirect("/dashboard");
  }

  // We will fetch the data inside the Client Component using a useEffect 
  // or just directly pass it down if we fetch it here.
  // The Prompt asks for GET /api/proposals/sent.
  // Let's do it server-side to be fast, or we can just render the client component and let it fetch.
  // Wait, if we use GET /api/proposals/sent, we can just fetch it directly server side.
  // Let's fetch it via direct Mongoose call to keep it fast and avoid internal fetch API calls.
  
  const { connectToDatabase } = await import("@/lib/mongodb");
  const { Proposal } = await import("@/models/Proposal");
  
  await connectToDatabase();
  
  const proposals = await Proposal.find({ freelancerId: session.user.id })
    .populate({
      path: "projectId",
      select: "title category status postedBy",
      populate: { path: "postedBy", select: "name image" },
    })
    .sort({ createdAt: -1 })
    .lean();

  const formattedProposals = proposals.map((p) => ({
    id: p._id.toString(),
    projectId: p.projectId?._id?.toString() || (p.projectId as any)?.toString() || "",
    projectTitle: (p.projectId as any)?.title || "Unknown Project",
    clientName: (p.projectId as any)?.postedBy?.name || "Unknown Client",
    proposedRate: p.proposedRate,
    message: p.message,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-muted/40 pt-20">
      <ProposalsClient initialProposals={formattedProposals} />
    </main>
  );
}
