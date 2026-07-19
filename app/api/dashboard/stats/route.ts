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
 * client:     { totalProjects, activeContracts, totalSpent, savedFreelancers }
 * freelancer: { totalSkills, receivedProposals, activeContracts,
 *               totalEarnings, profileViews }
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
      const [totalProjects, activeContracts, spentAgg, me] = await Promise.all([
        Project.countDocuments({ postedBy: userId }),
        Contract.countDocuments({ clientId: userId, status: "active" }),
        Contract.aggregate<{ total: number }>([
          { $match: { clientId: userId, status: "completed" } },
          { $group: { _id: null, total: { $sum: "$agreedRate" } } },
        ]),
        User.findById(userId).select("savedFreelancers").lean(),
      ]);

      return NextResponse.json({
        data: {
          role: "client",
          totalProjects,
          activeContracts,
          totalSpent: spentAgg[0]?.total ?? 0,
          savedFreelancers: me?.savedFreelancers?.length ?? 0,
        },
      });
    }

    const [totalSkills, receivedProposals, activeContracts, earningsAgg, me] =
      await Promise.all([
        Skill.countDocuments({ providerId: userId }),
        // Proposals received = proposals on projects this user posted.
        Project.find({ postedBy: userId })
          .select("_id")
          .lean()
          .then((projects) =>
            projects.length
              ? Proposal.countDocuments({
                  projectId: { $in: projects.map((p) => p._id) },
                })
              : 0
          ),
        Contract.countDocuments({ freelancerId: userId, status: "active" }),
        Contract.aggregate<{ total: number }>([
          { $match: { freelancerId: userId, status: "completed" } },
          { $group: { _id: null, total: { $sum: "$agreedRate" } } },
        ]),
        User.findById(userId).select("profileViews").lean(),
      ]);

    return NextResponse.json({
      data: {
        role: "freelancer",
        totalSkills,
        receivedProposals,
        activeContracts,
        totalEarnings: earningsAgg[0]?.total ?? 0,
        profileViews: me?.profileViews ?? 0,
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/dashboard/stats]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
