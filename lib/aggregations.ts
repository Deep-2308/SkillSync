import mongoose from "mongoose";
import { User } from "@/models/User";
import { Project } from "@/models/Project";
import { Contract } from "@/models/Contract";

/**
 * 1. getFreelancerListing
 * Uses $facet to return paginated results and total count in a single query.
 */
export async function getFreelancerListing(filters: Record<string, any>, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  // Base match for experts
  const matchStage: any = { role: "freelancer", isVerified: true, ...filters };

  const pipeline = [
    { $match: matchStage },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: limit },
          // Lookup their first 3 skills
          {
            $lookup: {
              from: "skills",
              let: { providerId: "$_id" },
              pipeline: [
                { $match: { $expr: { $eq: ["$providerId", "$$providerId"] } } },
                { $limit: 3 }
              ],
              as: "topSkills"
            }
          },
          // Project only the needed fields
          {
            $project: {
              name: 1,
              headline: 1,
              bio: 1,
              image: 1,
              location: 1,
              hourlyRate: 1,
              averageRating: 1,
              totalReviews: 1,
              topSkills: { title: 1, category: 1, rate: 1 }
            }
          }
        ]
      }
    }
  ];

  const result = await User.aggregate(pipeline);
  const metadata = result[0].metadata[0] || { total: 0 };
  const data = result[0].data;

  return {
    freelancers: data,
    total: metadata.total,
    page,
    totalPages: Math.ceil(metadata.total / limit)
  };
}

/**
 * 2. getProjectWithProposals
 * Looks up proposals for a project and groups them by status.
 */
export async function getProjectWithProposals(projectId: string) {
  const pipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(projectId) } },
    {
      $lookup: {
        from: "proposals",
        localField: "_id",
        foreignField: "projectId",
        as: "proposals"
      }
    },
    // Unwind proposals to lookup the proposer info
    { $unwind: { path: "$proposals", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "proposals.freelancerId",
        foreignField: "_id",
        as: "proposals.proposerInfo"
      }
    },
    // The lookup returns an array, take the first item
    {
      $addFields: {
        "proposals.proposerInfo": { $arrayElemAt: ["$proposals.proposerInfo", 0] }
      }
    },
    // Group back to a single project document, pushing the proposals into an array
    {
      $group: {
        _id: "$_id",
        projectData: { $first: "$$ROOT" },
        allProposals: { $push: "$proposals" }
      }
    },
    // Reformat the grouped data to place proposals inside project and project fields at the top
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$projectData", { proposals: "$allProposals" }]
        }
      }
    },
    // Project fields to clean up
    {
      $project: {
        "proposals.proposerInfo.passwordHash": 0,
        "proposals.proposerInfo.passwordResetToken": 0,
        "proposals.proposerInfo.passwordResetExpires": 0,
        allProposals: 0
      }
    }
  ];

  const results = await Project.aggregate(pipeline);
  return results[0] || null;
}

/**
 * 3. getDashboardStats
 * Single aggregation per role returning dashboard KPIs.
 */
export async function getDashboardStats(userId: string, role: "client" | "freelancer" | "admin") {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  if (role === "freelancer") {
    const pipeline = [
      { $match: { freelancerId: userObjectId } },
      {
        $group: {
          _id: null,
          totalEarnings: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, "$agreedRate", 0]
            }
          },
          activeContracts: {
            $sum: {
              $cond: [{ $eq: ["$status", "active"] }, 1, 0]
            }
          },
          completedContracts: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0]
            }
          }
        }
      }
    ];
    const results = await Contract.aggregate(pipeline);
    return results[0] || { totalEarnings: 0, activeContracts: 0, completedContracts: 0 };
  } else if (role === "client") {
    const pipeline = [
      { $match: { clientId: userObjectId } },
      {
        $group: {
          _id: null,
          totalSpent: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, "$agreedRate", 0]
            }
          },
          activeContracts: {
            $sum: {
              $cond: [{ $eq: ["$status", "active"] }, 1, 0]
            }
          }
        }
      }
    ];
    const results = await Contract.aggregate(pipeline);
    return results[0] || { totalSpent: 0, activeContracts: 0 };
  }

  return null;
}

/**
 * 4. getSearchResults
 * $text search with relevance scoring across multiple collections.
 */
export async function getSearchResults(query: string, type: "freelancers" | "projects", page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  if (type === "freelancers") {
    return await User.aggregate([
      { $match: { $text: { $search: query }, role: "freelancer" } },
      { $sort: { score: { $meta: "textScore" } } },
      { $skip: skip },
      { $limit: limit },
      { $project: { passwordHash: 0, passwordResetToken: 0, score: { $meta: "textScore" } } }
    ]);
  } else if (type === "projects") {
    return await Project.aggregate([
      { $match: { $text: { $search: query }, status: "open" } },
      { $sort: { score: { $meta: "textScore" } } },
      { $skip: skip },
      { $limit: limit },
      { $project: { score: { $meta: "textScore" } } }
    ]);
  }

  return [];
}
