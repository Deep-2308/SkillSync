import {
  BadgeCheck,
  BrainCircuit,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedSection } from "@/components/animated-section";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: BrainCircuit,
    title: "AI Matching",
    description:
      "Our matching engine reads intent, skills, and budget to surface the right people in seconds.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description:
      "Escrow-backed payments release only when work is delivered. No chasing invoices.",
  },
  {
    icon: BadgeCheck,
    title: "Freelancer Verification",
    description:
      "Every freelancer is identity-checked and portfolio-reviewed before they can take work.",
  },
  {
    icon: MessagesSquare,
    title: "Real-time Chat",
    description:
      "Scope projects, share files, and hop on calls without ever leaving the platform.",
  },
  {
    icon: Sparkles,
    title: "Portfolio Showcase",
    description:
      "Beautiful profiles that put work front and center and convert visitors into contracts.",
  },
  {
    icon: Zap,
    title: "Instant Hire",
    description:
      "Skip the back-and-forth. Hire a vetted freelancer and kick off your project in one click.",
  },
];

/**
 * Features grid — 3 columns (desktop) → 2 (tablet) → 1 (mobile). Each card
 * lifts and gains a brand border-glow on hover.
 */
export function Features() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6">
      <AnimatedSection animation="slideUp" className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you need to hire or get hired
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          A complete toolkit for matching, collaborating, and getting paid — built for speed and trust.
        </p>
      </AnimatedSection>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <AnimatedSection key={feature.title} animation="slideUp" delay={i * 80}>
            <FeatureCard {...feature} />
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, description }: Feature) {
  return (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-xl border bg-card p-6 transition-all duration-300",
        "hover:-translate-y-1 hover:border-brand/50 hover:shadow-card-hover"
      )}
    >
      {/* Border-glow: a soft radial that fades in on hover. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(400px circle at 50% 0%, var(--color-brand)/8%, transparent 60%)",
        }}
      />
      <div className="relative flex flex-col gap-4">
        <div className="flex size-12 items-center justify-center rounded-lg bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-primary-foreground">
          <Icon className="size-6" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
