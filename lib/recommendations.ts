import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { User } from "@/models/User";

/**
 * Fetches recommended projects for a freelancer.
 * Currently uses a simple database query matching the freelancer's categories (skills).
 * To be replaced with AI-powered matching in Phase 7.
 */
export async function getRecommendedProjects(freelancerId: any, limit: number = 3) {
  await connectToDatabase();
  
  const user = await User.findById(freelancerId).select("skills").lean();
  const userSkills = user?.skills || [];
  
  // If the user has no skills listed, we just fetch the newest open projects
  const filter: any = userSkills.length > 0 
    ? { status: "open", category: { $in: userSkills } } 
    : { status: "open" };

  const projects = await Project.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
    
  return projects;
}
