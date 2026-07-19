import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/admin";
import { User } from "@/models/User";
import { Project } from "@/models/Project";
import { Skill } from "@/models/Skill";
import { Contract } from "@/models/Contract";
import { Review } from "@/models/Review";
import { Proposal } from "@/models/Proposal";

/**
 * GET /api/admin/stats — Platform-wide metrics (admin only).
 * All counts run in parallel; GMV = sum of completed contracts' agreedRate.
 */
export async function GET() {
  try {
    await getAdminSession();
    await connectToDatabase();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      providers,
      bannedUsers,
      newUsers30d,
      totalProjects,
      openProjects,
      totalSkills,
      totalProposals,
      activeContracts,
      completedContracts,
      disputedContracts,
      totalReviews,
      gmvAgg,
      signupsSeries,
      projectsSeries,
      gmvSeries,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "freelancer" }),
      User.countDocuments({ banned: true }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Project.countDocuments({}),
      Project.countDocuments({ status: "open" }),
      Skill.countDocuments({}),
      Proposal.countDocuments({}),
      Contract.countDocuments({ status: "active" }),
      Contract.countDocuments({ status: "completed" }),
      Contract.countDocuments({ status: "disputed" }),
      Review.countDocuments({}),
      Contract.aggregate<{ total: number }>([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$agreedRate" } } },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      Project.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      Contract.aggregate([
        { $match: { status: "completed", updatedAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: "$updatedAt" }, month: { $month: "$updatedAt" } }, total: { $sum: "$agreedRate" } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
    ]);

    const formatSeries = (data: any[], valueKey: string) => {
      return data.map(d => ({
        date: `${d._id.year}-${String(d._id.month).padStart(2, '0')}`,
        value: d[valueKey],
      }));
    };

    return NextResponse.json({
      data: {
        users: {
          total: totalUsers,
          providers,
          banned: bannedUsers,
          newLast30Days: newUsers30d,
        },
        marketplace: {
          projects: totalProjects,
          openProjects,
          skills: totalSkills,
          proposals: totalProposals,
        },
        contracts: {
          active: activeContracts,
          completed: completedContracts,
          disputed: disputedContracts,
          gmv: gmvAgg[0]?.total ?? 0,
        },
        reviews: { total: totalReviews },
        timeSeries: {
          signups: formatSeries(signupsSeries || [], "count"),
          projects: formatSeries(projectsSeries || [], "count"),
          gmv: formatSeries(gmvSeries || [], "total"),
        }
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
