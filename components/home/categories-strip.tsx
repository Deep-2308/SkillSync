import Link from "next/link";
import {
  BrainCircuit,
  Briefcase,
  Clapperboard,
  Cloud,
  Code,
  Figma,
  Megaphone,
  Palette,
  PenLine,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

import { categories } from "@/data/categories";
import { AnimatedSection } from "@/components/animated-section";

/**
 * Maps the string icon names stored in data/categories.ts to real Lucide
 * components. Keeping the data serializable (strings) means it can also be
 * shared with the server/DB; the mapping lives here at the render boundary.
 */
const iconMap: Record<string, LucideIcon> = {
  Code,
  Smartphone,
  Figma,
  Palette,
  PenLine,
  Megaphone,
  Clapperboard,
  BrainCircuit,
  Cloud,
  Briefcase,
};

/**
 * Horizontally scrollable strip of skill categories with gradient edge fades.
 */
export function CategoriesStrip() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
      <AnimatedSection animation="slideUp" className="mb-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Explore top categories
        </h2>
      </AnimatedSection>

      <AnimatedSection animation="fadeIn" delay={120} className="relative">
        {/* Edge fades hint at scrollability. pointer-events-none so they don't
            block clicks on the cards underneath. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />

        <div className="flex gap-4 overflow-x-auto scroll-smooth px-2 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => {
            const Icon = iconMap[category.icon] ?? Code;
            return (
              <Link
                key={category.id}
                href={`/hire-talent?category=${category.slug}`}
                className="group flex min-w-[9rem] shrink-0 flex-col items-center gap-3 rounded-xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/50 hover:shadow-card-hover"
              >
                <span className="flex size-12 items-center justify-center rounded-lg bg-brand/10 text-brand transition-transform duration-300 group-hover:scale-110">
                  <Icon className="size-6" />
                </span>
                <span className="text-sm font-medium">{category.name}</span>
              </Link>
            );
          })}
        </div>
      </AnimatedSection>
    </section>
  );
}
