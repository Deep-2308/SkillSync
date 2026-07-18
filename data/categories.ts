import type { Category } from "@/types";

/**
 * Static category catalog used across the app (home page, filters, skill forms).
 * Kept as static data since categories change rarely and don't warrant a DB table yet.
 */
export const categories: Category[] = [
  {
    id: "cat_dev",
    name: "Software Development",
    slug: "software-development",
    icon: "Code",
    description: "Web, mobile, and backend engineering.",
  },
  {
    id: "cat_design",
    name: "Design",
    slug: "design",
    icon: "Palette",
    description: "UI/UX, branding, and visual design.",
  },
  {
    id: "cat_data",
    name: "Data & AI",
    slug: "data-ai",
    icon: "BrainCircuit",
    description: "Data science, ML, and analytics.",
  },
  {
    id: "cat_marketing",
    name: "Marketing",
    slug: "marketing",
    icon: "Megaphone",
    description: "SEO, content, and growth strategy.",
  },
  {
    id: "cat_writing",
    name: "Writing",
    slug: "writing",
    icon: "PenLine",
    description: "Copywriting, editing, and technical docs.",
  },
  {
    id: "cat_business",
    name: "Business",
    slug: "business",
    icon: "Briefcase",
    description: "Consulting, finance, and operations.",
  },
  {
    id: "cat_music",
    name: "Music & Audio",
    slug: "music-audio",
    icon: "Music",
    description: "Production, mixing, and instrument lessons.",
  },
  {
    id: "cat_languages",
    name: "Languages",
    slug: "languages",
    icon: "Languages",
    description: "Tutoring and conversation practice.",
  },
];

/** Convenience lookup by slug. */
export const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
