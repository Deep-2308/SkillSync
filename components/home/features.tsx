import {
  BrainCircuit,
  FileEdit,
  Sparkles,
  Calculator,
  MessageSquareQuote,
  Bot,
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
    title: "Smart Matching",
    description:
      "Our matching engine reads intent, skills, and budget to surface the right people in seconds.",
  },
  {
    icon: FileEdit,
    title: "Hiring Copilot",
    description:
      "AI assists with drafting project briefs and evaluating proposals to find the perfect fit.",
  },
  {
    icon: Sparkles,
    title: "AI Writing Studio",
    description:
      "Assist freelancers in writing proposals and profiles that stand out and win work.",
  },
  {
    icon: Calculator,
    title: "Smart Pricing",
    description:
      "Data-driven rate recommendations ensure projects are priced fairly for the current market.",
  },
  {
    icon: MessageSquareQuote,
    title: "Review Intelligence",
    description:
      "Summarizes past feedback to highlight strengths and weaknesses at a glance.",
  },
  {
    icon: Bot,
    title: "SyncMate Assistant",
    description:
      "Your dedicated chatbot for platform help, onboarding, and quick actions.",
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
          Powered by AI
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          A complete suite of intelligent tools designed to streamline hiring and collaboration.
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
