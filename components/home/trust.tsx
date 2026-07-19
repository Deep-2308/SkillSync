import { ShieldCheck, Star, HelpCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedSection } from "@/components/animated-section";

interface TrustSignal {
  icon: LucideIcon;
  title: string;
  description: string;
}

const trustSignals: TrustSignal[] = [
  {
    icon: ShieldCheck,
    title: "Secure payments via Stripe",
    description: "Funds are held in escrow and released only when work is delivered.",
  },
  {
    icon: Star,
    title: "Verified reviews",
    description: "Every review is tied to a completed contract on the platform.",
  },
  {
    icon: HelpCircle,
    title: "Dispute support",
    description: "Mediation assistance if things don't go according to plan.",
  },
];

export function Trust() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6">
      <AnimatedSection animation="slideUp" className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Built on Trust
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Your security and peace of mind are built directly into the platform.
        </p>
      </AnimatedSection>

      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        {trustSignals.map((signal, i) => {
          const Icon = signal.icon;
          return (
            <AnimatedSection key={signal.title} animation="slideUp" delay={i * 100}>
              <div className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl border bg-card/50">
                <div className="flex size-14 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Icon className="size-7" />
                </div>
                <h3 className="text-xl font-semibold">{signal.title}</h3>
                <p className="text-muted-foreground">
                  {signal.description}
                </p>
              </div>
            </AnimatedSection>
          );
        })}
      </div>
    </section>
  );
}
