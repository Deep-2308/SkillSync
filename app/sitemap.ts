import { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { Skill } from "@/models/Skill";
import { User } from "@/models/User";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://skillsync.com";

  // Static routes
  const routes = ["", "/about", "/services", "/contact", "/privacy", "/terms"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : 0.8,
    })
  );

  try {
    await connectToDatabase();

    // Fetch dynamic gigs
    const gigs = await Skill.find({ isPublished: true }).select("slug updatedAt").lean();
    const gigRoutes = gigs.map((gig) => ({
      url: `${baseUrl}/gigs/${gig.slug}`,
      lastModified: gig.updatedAt ? new Date(gig.updatedAt).toISOString() : new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    // Fetch dynamic freelancers
    const freelancers = await User.find({ role: "freelancer", banned: false }).select("_id updatedAt").lean();
    const freelancerRoutes = freelancers.map((f) => ({
      url: `${baseUrl}/freelancers/${f._id.toString()}`,
      lastModified: f.updatedAt ? new Date(f.updatedAt).toISOString() : new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    return [...routes, ...gigRoutes, ...freelancerRoutes];
  } catch (error) {
    console.error("Failed to generate sitemap", error);
    return routes;
  }
}
