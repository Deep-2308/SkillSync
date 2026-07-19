import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/animated-section";
import { WatchDemoDialog } from "@/components/home/watch-demo-dialog";
import { HeroIllustration } from "@/components/home/hero-illustration";

const stats = [
  { value: "50K+", label: "Users" },
  { value: "25K+", label: "Projects" },
  { value: "4.9", label: "Rating" },
  { value: "98%", label: "Success" },
] as const;

/**
 * Hero section — near-full-viewport, gradient background, animated headline,
 * dual CTAs, an SVG network illustration, floating stat cards, and pure-CSS
 * background blobs.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden">
      {/* Background gradient: blue-50→white (light) / blue-900→slate-900 (dark) */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-slate-900" />

      {/* Decorative floating blobs (pure CSS, reduced-motion aware) */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-blob absolute -top-24 -left-16 size-96 rounded-full bg-brand/20 blur-3xl" />
        <div className="animate-blob absolute top-1/3 -right-16 size-96 rounded-full bg-brand-green/20 blur-3xl [animation-delay:3s]" />
        <div className="animate-blob absolute bottom-0 left-1/3 size-80 rounded-full bg-brand-amber/15 blur-3xl [animation-delay:6s]" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
        {/* Left: copy + CTAs */}
        <div className="flex flex-col items-start gap-6">
          <AnimatedSection animation="fadeIn">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
              <Sparkles className="size-4 text-brand" />
              The smart freelancer marketplace for modern teams
            </span>
          </AnimatedSection>

          <AnimatedSection animation="slideUp" delay={80}>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              {/* Animated gradient text: oversized bg + panning keyframes */}
              <span className="animate-gradient-x bg-[length:200%_auto] bg-gradient-to-r from-brand via-brand-green to-brand bg-clip-text text-transparent">
                Hire smarter. Work smarter.
              </span>
            </h1>
          </AnimatedSection>

          <AnimatedSection animation="slideUp" delay={160}>
            <p className="max-w-xl text-pretty text-lg text-muted-foreground">
              SkillSync connects businesses with vetted freelance professionals —
              matched by AI, protected by secure payments, and backed by real
              reviews.
            </p>
          </AnimatedSection>

          <AnimatedSection animation="slideUp" delay={240}>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="gap-2 shadow-brand">
                <Link href="/signup">
                  Get Started Free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <WatchDemoDialog />
            </div>
          </AnimatedSection>
        </div>

        {/* Right: illustration + floating stat cards */}
        <div className="relative">
          <AnimatedSection animation="slideInRight" delay={200}>
            <HeroIllustration className="w-full drop-shadow-xl" />
          </AnimatedSection>

          {/* Floating stat cards — staggered slide-up on load, then gentle float */}
          <div className="pointer-events-none absolute inset-0">
            {stats.map((stat, i) => (
              <AnimatedSection
                key={stat.label}
                animation="slideUp"
                delay={400 + i * 120}
                className={statCardPosition(i)}
              >
                <div className="animate-float rounded-xl border bg-background/80 px-4 py-3 shadow-lg backdrop-blur [animation-delay:var(--d)]"
                  style={{ ["--d" as string]: `${i * 0.6}s` }}
                >
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Scatter the four stat cards around the illustration's corners. */
function statCardPosition(index: number): string {
  const positions = [
    "absolute -left-2 top-4",
    "absolute right-0 top-1/4",
    "absolute -left-4 bottom-8",
    "absolute right-4 bottom-0",
  ];
  return positions[index] ?? "";
}
