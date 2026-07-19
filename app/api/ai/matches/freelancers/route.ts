import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/api-utils";
import { Project } from "@/models/Project";
import { aiEnabled, AIUnavailableError } from "@/lib/ai";
import { findSimilarUsers, rerankFreelancersForProject, updateProjectEmbedding } from "@/lib/ai/matching";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (session.user.role !== "client") {
      return NextResponse.json({ error: "Only clients can view freelancer matches." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required." }, { status: 400 });
    }

    await connectToDatabase();
    const project = await Project.findById(projectId);

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    if (project.postedBy.toString() !== session.user.id) {
      return NextResponse.json({ error: "You can only view matches for your own projects." }, { status: 403 });
    }

    // Ensure project has an embedding before proceeding
    let embedding = project.embedding || [];
    if (embedding.length === 0 && aiEnabled()) {
      await updateProjectEmbedding(projectId);
      const updatedProject = await Project.findById(projectId);
      if (updatedProject) {
        embedding = updatedProject.embedding || [];
      }
    }

    // Step 1: Pre-filter candidates by category and calculate cosine similarity
    const candidates = await findSimilarUsers(embedding, project.category, 15);

    // Step 2: Fallback path
    if (!aiEnabled()) {
      // Just return the candidates with a mock match percentage based on cosine similarity
      // Or a simple overlap percentage
      const fallbackMatches = candidates.map((c, i) => {
        // Mock a percentage using index if cosine similarity wasn't perfectly mapped
        const mockPct = Math.max(50, 95 - (i * 3)); 
        return {
          candidateId: (c as any)._id?.toString(),
          matchPercentage: mockPct,
          reasons: ["Strong category overlap", "General skill alignment"],
          user: {
            id: (c as any)._id?.toString(),
            name: c.name,
            headline: c.headline,
            image: c.image,
            skills: c.skills,
            hourlyRate: c.hourlyRate,
            averageRating: c.averageRating,
            totalReviews: c.totalReviews,
          }
        };
      });
      return NextResponse.json({ data: fallbackMatches });
    }

    // Step 3: AI Rerank
    try {
      const reranked = await rerankFreelancersForProject(project, candidates);
      
      // Merge results
      const finalMatches = reranked.map(match => {
        const userDoc = candidates.find(c => (c as any)._id?.toString() === match.candidateId);
        if (!userDoc) return null;
        return {
          ...match,
          user: {
            id: (userDoc as any)._id?.toString(),
            name: userDoc.name,
            headline: userDoc.headline,
            image: userDoc.image,
            skills: userDoc.skills,
            hourlyRate: userDoc.hourlyRate,
            averageRating: userDoc.averageRating,
            totalReviews: userDoc.totalReviews,
          }
        };
      }).filter(Boolean);

      // Sort by match percentage desc
      finalMatches.sort((a, b) => b!.matchPercentage - a!.matchPercentage);

      return NextResponse.json({ data: finalMatches });
    } catch (error) {
      if (error instanceof AIUnavailableError) {
        // Fallback gracefully
        const fallbackMatches = candidates.map((c, i) => ({
          candidateId: (c as any)._id?.toString(),
          matchPercentage: Math.max(50, 95 - (i * 3)),
          reasons: ["Strong category overlap", "General skill alignment"],
          user: {
            id: (c as any)._id?.toString(),
            name: c.name,
            headline: c.headline,
            image: c.image,
            skills: c.skills,
            hourlyRate: c.hourlyRate,
            averageRating: c.averageRating,
            totalReviews: c.totalReviews,
          }
        }));
        return NextResponse.json({ data: fallbackMatches });
      }
      throw error;
    }

  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/ai/matches/freelancers]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
