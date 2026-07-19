import type { Category } from "@/types";

/**
 * The canonical freelancing category taxonomy — the ONLY category list in the
 * app. Home page strips, search filters, project posting, and skill forms must
 * all import from here so the taxonomy never forks again.
 *
 * Kept as static data since categories change rarely and don't warrant a DB
 * collection yet.
 */
export const categories: Category[] = [
  {
    id: "cat_webdev",
    name: "Web Development",
    slug: "web-development",
    icon: "Code",
    description: "Websites, web apps, and backend engineering.",
  },
  {
    id: "cat_mobile",
    name: "Mobile Development",
    slug: "mobile-development",
    icon: "Smartphone",
    description: "iOS, Android, and cross-platform apps.",
  },
  {
    id: "cat_uiux",
    name: "UI/UX Design",
    slug: "ui-ux-design",
    icon: "Figma",
    description: "Interfaces, prototypes, and product design.",
  },
  {
    id: "cat_graphic",
    name: "Graphic Design",
    slug: "graphic-design",
    icon: "Palette",
    description: "Branding, logos, and visual identity.",
  },
  {
    id: "cat_writing",
    name: "Content Writing",
    slug: "content-writing",
    icon: "PenLine",
    description: "Copywriting, editing, and technical docs.",
  },
  {
    id: "cat_marketing",
    name: "Digital Marketing",
    slug: "digital-marketing",
    icon: "Megaphone",
    description: "SEO, social media, and growth strategy.",
  },
  {
    id: "cat_video",
    name: "Video & Animation",
    slug: "video-animation",
    icon: "Clapperboard",
    description: "Editing, motion graphics, and explainers.",
  },
  {
    id: "cat_data",
    name: "Data & AI",
    slug: "data-ai",
    icon: "BrainCircuit",
    description: "Data science, ML, and analytics.",
  },
  {
    id: "cat_devops",
    name: "DevOps & Cloud",
    slug: "devops-cloud",
    icon: "Cloud",
    description: "Infrastructure, CI/CD, and cloud architecture.",
  },
  {
    id: "cat_business",
    name: "Business & Consulting",
    slug: "business-consulting",
    icon: "Briefcase",
    description: "Strategy, finance, and operations.",
  },
];

/** Convenience lookup by slug. */
export const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

/** Plain names array for simple <select> options. */
export const categoryNames = categories.map((c) => c.name);
