/**
 * Static seed skills used for local development and by scripts/seed.ts.
 * In production these live in MongoDB; this is representative demo content.
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
    category: "software-development",
    level: "advanced",
    hourlyRate: 85,
    tags: ["nextjs", "react", "typescript", "vercel"],
  },
  {
    title: "Product Design & Figma Prototyping",
    description:
      "From wireframes to high-fidelity, interactive prototypes. Learn a repeatable design workflow.",
    category: "design",
    level: "intermediate",
    hourlyRate: 70,
    tags: ["figma", "ui", "ux", "prototyping"],
  },
  {
    title: "Practical Machine Learning",
    description:
      "Hands-on ML: data prep, model selection, evaluation, and getting a model into production.",
    category: "data-ai",
    level: "advanced",
    hourlyRate: 95,
    tags: ["python", "ml", "pandas", "scikit-learn"],
  },
  {
    title: "SEO & Content Strategy",
    description:
      "Rank higher and convert better with a research-driven content plan and technical SEO fundamentals.",
    category: "marketing",
    level: "intermediate",
    hourlyRate: 60,
    tags: ["seo", "content", "analytics"],
  },
  {
    title: "Conversational Spanish for Beginners",
    description:
      "Speak from day one. Practical vocabulary, pronunciation, and real conversation practice.",
    category: "languages",
    level: "beginner",
    hourlyRate: 35,
    tags: ["spanish", "conversation", "tutoring"],
  },
];
