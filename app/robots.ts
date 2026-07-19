import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://skillsync.com";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/gigs/*", "/freelancers/*", "/about", "/services", "/contact", "/privacy", "/terms"],
      disallow: ["/api/*", "/dashboard", "/my-projects", "/my-proposals", "/admin", "/admin/*"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
