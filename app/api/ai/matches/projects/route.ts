import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/api-utils";
import { User } from "@/models/User";
import { aiEnabled, AIUnavailableError } from "@/lib/ai";
import { findSimilarProjects, rerankProjectsForFreelancer, updateUserEmbedding } from "@/lib/ai/matching";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (session.user.role !== "freelancer") {
      return NextResponse.json({ error: "Only freelancers can view project matches." }, { status: 403 });
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    
    // We match against the user's primary category (or the first in their list)
    const category = user.categories && user.categories.length > 0 ? user.categories[0] : "";
    if (!category) {
      return NextResponse.json({ data: [] }); // Can't match effectively without a category
    }

    // Ensure user has an embedding before proceeding
    let embedding = user.embedding || [];
    if (embedding.length === 0 && aiEnabled()) {
      await updateUserEmbedding(session.user.id);
      const updatedUser = await User.findById(session.user.id);
      if (updatedUser) {
        embedding = updatedUser.embedding || [];
      }
    }

    // Step 1: Pre-filter candidates by category and calculate cosine similarity
    const candidates = await findSimilarProjects(embedding, category, 15);

    // Step 2: Fallback path
    if (!aiEnabled()) {
      const fallbackMatches = candidates.map((p, i) => {
        const mockPct = Math.max(50, 95 - (i * 3)); 
        return {
          candidateId: (p as any)._id?.toString(),
          matchPercentage: mockPct,
          reasons: ["Strong category overlap", "General skill alignment"],
          project: {
            id: (p as any)._id?.toString(),
            title: p.title,
            description: p.description,
            skills: p.skills,
            budgetType: p.budgetType,
            budgetMax: p.budgetMax,
            budgetMin: p.budgetMin,
            hourlyRate: p.hourlyRate,
            experienceLevel: p.experienceLevel,
            postedBy: p.postedBy, // Needs populate if UI uses it directly, else just ID
          }
        };
      });
      return NextResponse.json({ data: fallbackMatches });
    }

    // Step 3: AI Rerank
    try {
      const reranked = await rerankProjectsForFreelancer(user, candidates);
      
      // Merge results
      const finalMatches = reranked.map(match => {
        const projectDoc = candidates.find(c => (c as any)._id?.toString() === match.candidateId);
        if (!projectDoc) return null;
        return {
          ...match,
          project: {
            id: (projectDoc as any)._id?.toString(),
            title: projectDoc.title,
            description: projectDoc.description,
            skills: projectDoc.skills,
            budgetType: projectDoc.budgetType,
            budgetMax: projectDoc.budgetMax,
            budgetMin: projectDoc.budgetMin,
            hourlyRate: projectDoc.hourlyRate,
            experienceLevel: projectDoc.experienceLevel,
            postedBy: projectDoc.postedBy,
          }
        };
      }).filter(Boolean);

      // Sort by match percentage desc
      finalMatches.sort((a, b) => b!.matchPercentage - a!.matchPercentage);

      return NextResponse.json({ data: finalMatches });
    } catch (error) {
      if (error instanceof AIUnavailableError) {
        // Fallback gracefully
        const fallbackMatches = candidates.map((p, i) => ({
          candidateId: (p as any)._id?.toString(),
          matchPercentage: Math.max(50, 95 - (i * 3)),
          reasons: ["Strong category overlap", "General skill alignment"],
          project: {
            id: (p as any)._id?.toString(),
            title: p.title,
            description: p.description,
            skills: p.skills,
            budgetType: p.budgetType,
            budgetMax: p.budgetMax,
            budgetMin: p.budgetMin,
            hourlyRate: p.hourlyRate,
            experienceLevel: p.experienceLevel,
            postedBy: p.postedBy,
          }
        }));
        return NextResponse.json({ data: fallbackMatches });
      }
      throw error;
    }

  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/ai/matches/projects]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
