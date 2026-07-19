import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { ClientDashboard } from "./ClientDashboard";
import { Project } from "@/models/Project";
import { Proposal } from "@/models/Proposal";
import { Contract } from "@/models/Contract";
import { Notification } from "@/models/Notification";
import { User } from "@/models/User";
import { Types } from "mongoose";
import { ProtectedRoute } from "@/components/ProtectedRoute"; // We can't use ProtectedRoute in a server component directly if it's a Client Component that needs children, but wait, usually you just check session on the server.

import { Review } from "@/models/Review";
import { getRecommendedProjects } from "@/lib/recommendations";
import { FreelancerDashboard } from "./FreelancerDashboard";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getAuthSession();
  const userId = new Types.ObjectId(session.user.id);
  
  if (session.user.role !== "client") {
    await connectToDatabase();

    // 1. Fetch Freelancer Stats (mirroring API)
    const [
      activeContracts,
      earningsAgg,
      earningsByMonth,
      proposalsPipelineAgg,
      me,
      recentReviews,
      notifications,
      recommendedProjects
    ] = await Promise.all([
      Contract.countDocuments({ freelancerId: userId, status: "active" }),
      Contract.aggregate<{ total: number }>([
        { $match: { freelancerId: userId, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$agreedRate" } } },
      ]),
      Contract.aggregate<{ month: number; year: number; total: number }>([
        { $match: { freelancerId: userId, status: "completed" } },
        {
          $group: {
            _id: { month: { $month: "$updatedAt" }, year: { $year: "$updatedAt" } },
            total: { $sum: "$agreedRate" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $project: { _id: 0, month: "$_id.month", year: "$_id.year", total: 1 } },
      ]),
      Proposal.aggregate<{ _id: string; count: number }>([
        { $match: { freelancerId: userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      User.findById(userId).select("profileViews averageRating").lean(),
      Review.find({ targetId: userId }).sort({ createdAt: -1 }).limit(3).populate("reviewerId", "name image").lean(),
      Notification.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
      getRecommendedProjects(userId, 3)
    ]);

    const pipelineCounts = proposalsPipelineAgg.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {} as Record<string, number>);

    const stats = {
      activeContracts,
      pendingProposals: pipelineCounts["pending"] || 0,
      totalEarnings: earningsAgg[0]?.total ?? 0,
      averageRating: me?.averageRating ?? 0,
    };

    const proposalPipeline = {
      pending: pipelineCounts["pending"] || 0,
      accepted: pipelineCounts["accepted"] || 0,
      rejected: pipelineCounts["rejected"] || 0,
      withdrawn: pipelineCounts["withdrawn"] || 0,
    };

    return (
      <FreelancerDashboard 
        user={session.user} 
        stats={stats} 
        earningsSnapshot={earningsByMonth}
        proposalPipeline={proposalPipeline}
        recommendedProjects={recommendedProjects.map(p => ({ ...p, id: p._id.toString() }))}
        recentReviews={recentReviews.map(r => ({ ...r, id: r._id.toString() }))}
        notifications={notifications.map(n => ({ ...n, id: n._id.toString() }))}
      />
    );
  }

  // It's a client. Fetch the real data server-side.
  await connectToDatabase();

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
