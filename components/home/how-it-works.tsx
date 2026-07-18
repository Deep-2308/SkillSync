import { Handshake, Search, Wallet, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedSection } from "@/components/animated-section";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: Search,
    title: "Post or Browse",
    description:
      "Describe what you need or explore thousands of vetted skills across every category.",
  },
  {
    icon: Handshake,
    title: "Match & Connect",
    description:
      "Get AI-matched with the best fit, chat in real time, and agree on scope and timing.",
  },
  {
    icon: Wallet,
    title: "Work & Pay",
    description:
      "Collaborate, then release escrow-secured payment once you're happy with the work.",
  },
];

/**
 * How It Works — 3 steps with a connecting line on desktop. On desktop the
 * layout alternates (icon left / text right, then reversed); on mobile it
 * stacks vertically.
 */
export function HowItWorks() {
  return (
    <section className="relative border-y bg-muted/30">
      <div className="mx-auto w-full max-w-5xl px-4 py-24 sm:px-6">
        <AnimatedSection animation="slideUp" className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From idea to done in three simple steps.
          </p>
        </AnimatedSection>

        <ol className="mt-16 flex flex-col gap-12">
          {steps.map((step, i) => {
            const reversed = i % 2 === 1;
            return (
              <li key={step.title} className="relative">
                <AnimatedSection
                  animation={reversed ? "slideInRight" : "slideInLeft"}
                  delay={i * 100}
                >
                  <div
                    className={cn(
                      "flex flex-col items-center gap-6 sm:flex-row sm:gap-10",
                      reversed && "sm:flex-row-reverse"
                    )}
                  >
                    {/* Icon medallion with the step number badge */}
                    <div className="relative shrink-0">
                      <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-green text-primary-foreground shadow-brand">
                        <step.icon className="size-9" />
                      </div>
                      <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full border-2 border-background bg-foreground text-xs font-bold text-background">
                        {i + 1}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "text-center sm:text-left",
                        reversed && "sm:text-right"
                      )}
                    >
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <p className="mt-2 max-w-md text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>

                {/* Connector line to the next step (desktop only) */}
                {i < steps.length - 1 && (
                  <div
                    aria-hidden
                    className="absolute left-1/2 top-[calc(100%+0.5rem)] hidden h-8 w-px -translate-x-1/2 bg-gradient-to-b from-brand/60 to-transparent sm:block"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
