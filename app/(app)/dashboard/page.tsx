import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { DashboardClient } from "./DashboardClient";
import { ClientDashboard } from "./ClientDashboard";
import { Project } from "@/models/Project";
import { Proposal } from "@/models/Proposal";
import { Contract } from "@/models/Contract";
import { Notification } from "@/models/Notification";
import { User } from "@/models/User";
import { Types } from "mongoose";
import { ProtectedRoute } from "@/components/ProtectedRoute"; // We can't use ProtectedRoute in a server component directly if it's a Client Component that needs children, but wait, usually you just check session on the server.

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getAuthSession();
  
  if (session.user.role !== "client") {
    return <DashboardClient />; // Freelancer view (will be rebuilt in Prompt 13)
  }

  // It's a client. Fetch the real data server-side.
  await connectToDatabase();
  const userId = new Types.ObjectId(session.user.id);

  // 1. KPIs
  const [totalProjects, activeProjects, activeContracts, spentAgg] = await Promise.all([
    Project.countDocuments({ postedBy: userId }),
    Project.countDocuments({ postedBy: userId, status: "open" }),
    Contract.countDocuments({ clientId: userId, status: "active" }),
    Contract.aggregate<{ total: number }>([
      { $match: { clientId: userId, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$agreedRate" } } },
    ]),
  ]);

  let proposalsAwaitingReview = 0;
  let recentProposals: any[] = [];
  
  if (totalProjects > 0) {
    const userProjects = await Project.find({ postedBy: userId }).select("_id title").lean();
    const projectIds = userProjects.map(p => p._id);
    
    proposalsAwaitingReview = await Proposal.countDocuments({
      projectId: { $in: projectIds },
      status: "pending"
    });

    // 2. Needs Your Attention (Newest pending proposals)
    recentProposals = await Proposal.find({
      projectId: { $in: projectIds },
      status: "pending"
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("freelancerId", "name image")
      .populate("projectId", "title")
      .lean();
  }

  // Map populated fields for the component
  const formattedProposals = recentProposals.map(p => ({
    ...p,
    freelancer: p.freelancerId, // Re-map for the component
    project: p.projectId, // Re-map for the component
  }));

  // 3. Recent Activity (Notifications)
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  // 4. Active Contracts (with payment status)
  const contracts = await Contract.find({ clientId: userId, status: "active" })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("freelancerId", "name")
    .lean();
    
  const formattedContracts = contracts.map(c => ({
    ...c,
    freelancer: c.freelancerId,
  }));

  const stats = {
    totalProjects,
    activeProjects,
    proposalsAwaitingReview,
    activeContracts,
    totalSpent: spentAgg[0]?.total ?? 0,
  };

  return (
    <ClientDashboard
      user={session.user}
      stats={stats}
      proposals={formattedProposals}
      notifications={notifications}
      contracts={formattedContracts}
    />
  );
}
