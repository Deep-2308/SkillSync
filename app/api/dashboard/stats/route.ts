import { NextResponse } from "next/server";
import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { Contract } from "@/models/Contract";
import { Project } from "@/models/Project";
import { Proposal } from "@/models/Proposal";
import { Skill } from "@/models/Skill";
import { User } from "@/models/User";

/**
 * GET /api/dashboard/stats — Role-aware dashboard overview numbers.
 *
 * client:     { totalProjects, activeProjects, proposalsAwaitingReview, activeContracts, totalSpent, savedFreelancers }
 * freelancer: { totalSkills, receivedProposals, activeContracts, totalEarnings, profileViews }
 * admins get the freelancer shape (they can use /api/admin/stats for platform data).
 *
 * Money figures aggregate completed contracts' agreedRate. Every metric is one
 * indexed count/aggregation and they all run in parallel.
 */
export async function GET() {
  try {
    const session = await getAuthSession();
    await connectToDatabase();

    const userId = new Types.ObjectId(session.user.id);
    const isFreelancer =
      session.user.role === "freelancer" || session.user.role === "admin";

    if (!isFreelancer) {
      const [totalProjects, activeProjects, activeContracts, spentAgg, me] = await Promise.all([
        Project.countDocuments({ postedBy: userId }),
        Project.countDocuments({ postedBy: userId, status: "open" }),
        Contract.countDocuments({ clientId: userId, status: "active" }),
        Contract.aggregate<{ total: number }>([
          { $match: { clientId: userId, status: "completed" } },
          { $group: { _id: null, total: { $sum: "$agreedRate" } } },
        ]),
        User.findById(userId).select("savedFreelancers").lean(),
      ]);

      // Proposals awaiting review
      let proposalsAwaitingReview = 0;
      if (totalProjects > 0) {
        const userProjects = await Project.find({ postedBy: userId }).select("_id").lean();
        proposalsAwaitingReview = await Proposal.countDocuments({
          projectId: { $in: userProjects.map(p => p._id) },
          status: "pending"
        });
      }

      return NextResponse.json({
        data: {
          role: "client",
          totalProjects,
          activeProjects,
          proposalsAwaitingReview,
          activeContracts,
          totalSpent: spentAgg[0]?.total ?? 0,
          savedFreelancers: me?.savedFreelancers?.length ?? 0,
        },
      });
    }

    const [
      activeContracts,
      earningsAgg,
      earningsByMonth,
      proposalsPipelineAgg,
      me,
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
            _id: {
              month: { $month: "$updatedAt" },
              year: { $year: "$updatedAt" },
            },
            total: { $sum: "$agreedRate" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
          $project: {
            _id: 0,
            month: "$_id.month",
            year: "$_id.year",
            total: 1,
          },
        },
      ]),
      Proposal.aggregate<{ _id: string; count: number }>([
        { $match: { freelancerId: userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      User.findById(userId).select("profileViews averageRating").lean(),
    ]);

    const pipelineCounts = proposalsPipelineAgg.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      data: {
        role: "freelancer",
        activeContracts,
        pendingProposals: pipelineCounts["pending"] || 0,
        totalEarnings: earningsAgg[0]?.total ?? 0,
        averageRating: me?.averageRating ?? 0,
        profileViews: me?.profileViews ?? 0,
        earningsSnapshot: earningsByMonth,
        proposalPipeline: {
          pending: pipelineCounts["pending"] || 0,
          accepted: pipelineCounts["accepted"] || 0,
          rejected: pipelineCounts["rejected"] || 0,
          withdrawn: pipelineCounts["withdrawn"] || 0,
        },
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/dashboard/stats]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
