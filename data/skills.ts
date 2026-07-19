/**
 * Static seed skills used for local development demo content.
 * In production these live in MongoDB; this is representative demo content.
 * Categories reference the canonical taxonomy in data/categories.ts (by name).
 */
export interface SeedSkill {
  title: string;
  description: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  hourlyRate: number;
  tags: string[];
}

export const seedSkills: SeedSkill[] = [
  {
    title: "Full-Stack Web Development with Next.js",
    description:
      "Build and ship production React apps: App Router, server components, auth, and deployment on Vercel.",
    category: "Web Development",
    level: "advanced",
    hourlyRate: 85,
    tags: ["nextjs", "react", "typescript", "vercel"],
  },
  {
    title: "Product Design & Figma Prototyping",
    description:
      "From wireframes to high-fidelity, interactive prototypes with a repeatable design workflow.",
    category: "UI/UX Design",
    level: "intermediate",
    hourlyRate: 70,
    tags: ["figma", "ui", "ux", "prototyping"],
  },
  {
    title: "Practical Machine Learning",
    description:
      "Hands-on ML: data prep, model selection, evaluation, and getting a model into production.",
    category: "Data & AI",
    level: "advanced",
    hourlyRate: 95,
    tags: ["python", "ml", "pandas", "scikit-learn"],
  },
  {
    title: "SEO & Content Strategy",
    description:
      "Rank higher and convert better with a research-driven content plan and technical SEO fundamentals.",
    category: "Digital Marketing",
    level: "intermediate",
    hourlyRate: 60,
    tags: ["seo", "content", "analytics"],
  },
  {
    title: "Motion Graphics & Explainer Videos",
    description:
      "Polished After Effects animations and explainer videos that make your product's value obvious in 60 seconds.",
    category: "Video & Animation",
    level: "intermediate",
    hourlyRate: 55,
    tags: ["after-effects", "motion", "explainer"],
  },
];
