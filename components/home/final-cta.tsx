import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/animated-section";

/**
 * Closing call-to-action. Uses a bold brand→green diagonal gradient (distinct
 * from the hero's soft vertical wash) with a subtle grid overlay for depth.
 */
export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6">
      <AnimatedSection animation="slideUp">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand to-brand-green px-6 py-16 text-center shadow-brand sm:px-16 sm:py-24">
          {/* Radial highlight + grid texture */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.4), transparent 60%)",
            }}
          />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Ready to sync your skills?
            </h2>
            <p className="text-lg text-white/90">
              Join 50,000+ clients and freelancers hiring and working on SkillSync.
              It’s free to get started.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="gap-2 bg-white text-brand hover:bg-white/90"
              >
                <Link href="/signup">
                  Get Started Free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/explore">Browse Talent</Link>
              </Button>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
