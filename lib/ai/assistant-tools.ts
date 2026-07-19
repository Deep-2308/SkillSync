import { Contract } from "@/models/Contract";
import { Proposal } from "@/models/Proposal";
import { Conversation } from "@/models/Conversation";
import { Project } from "@/models/Project";
import { connectToDatabase } from "@/lib/mongodb";

export async function fetchUserCounts(userId: string, role: string) {
  await connectToDatabase();

  let pendingProposals = 0;
  if (role === "freelancer") {
    pendingProposals = await Proposal.countDocuments({ freelancerId: userId, status: "pending" });
  } else {
    // Client: count proposals on their projects
    const userProjects = await Project.find({ postedBy: userId }).select("_id").lean();
    if (userProjects.length > 0) {
      pendingProposals = await Proposal.countDocuments({
        projectId: { $in: userProjects.map((p) => p._id) },
        status: "pending",
      });
    }
  }

  const activeContracts = await Contract.countDocuments({
    [role === "freelancer" ? "freelancerId" : "clientId"]: userId,
    status: "active",
  });

  const unreadMessages = await Conversation.countDocuments({
    unreadCounts: { $elemMatch: { userId: userId, count: { $gt: 0 } } },
  });

  return { activeContracts, pendingProposals, unreadMessages };
}
