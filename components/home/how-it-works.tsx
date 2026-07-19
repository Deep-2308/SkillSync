import { 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  UserCircle, 
  Search, 
  Wallet 
} from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedSection } from "@/components/animated-section";

const clientSteps = [
  {
    icon: FileText,
    title: "Post a project",
    description: "Describe what you need in seconds.",
  },
  {
    icon: Sparkles,
    title: "Get AI-matched",
    description: "Receive proposals from the best-fit freelancers.",
  },
  {
    icon: ShieldCheck,
    title: "Hire and pay securely",
    description: "Collaborate and release funds only when done.",
  },
];

const freelancerSteps = [
  {
    icon: UserCircle,
    title: "Create a profile",
    description: "Showcase your skills and past work.",
  },
  {
    icon: Search,
    title: "Get matched",
    description: "Find relevant projects recommended by AI.",
  },
  {
    icon: Wallet,
    title: "Deliver and get paid",
    description: "Complete the work and receive secure payments.",
  },
];

/**
 * How It Works — Two parallel tracks for Clients and Freelancers.
 * Stacks vertically on mobile, side-by-side on desktop.
 */
export function HowItWorks() {
  return (
    <section className="relative border-y bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6">
        <AnimatedSection animation="slideUp" className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A streamlined process whether you're hiring or looking for work.
          </p>
        </AnimatedSection>

        <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-8">
          {/* Client Track */}
          <div>
            <AnimatedSection animation="slideInLeft">
              <div className="mb-8 rounded-2xl bg-brand/10 px-6 py-4 text-center border border-brand/20">
                <h3 className="text-xl font-bold text-brand">For Clients</h3>
              </div>
            </AnimatedSection>
            
            <ol className="flex flex-col gap-12 relative">
              {clientSteps.map((step, i) => (
                <li key={step.title} className="relative z-10">
                  <AnimatedSection animation="slideInLeft" delay={i * 100}>
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:text-left text-center">
                      <div className="relative shrink-0">
                        <div className="flex size-16 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-green text-primary-foreground shadow-brand">
                          <step.icon className="size-8" />
                        </div>
                        <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border-2 border-background bg-foreground text-xs font-bold text-background">
                          {i + 1}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold">{step.title}</h4>
                        <p className="mt-1 text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </AnimatedSection>
                </li>
              ))}
              {/* Connector line */}
              <div
                aria-hidden
                className="absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-brand/60 to-transparent hidden sm:block -z-10"
              />
            </ol>
          </div>

          {/* Freelancer Track */}
          <div>
            <AnimatedSection animation="slideInRight">
              <div className="mb-8 rounded-2xl bg-brand-green/10 px-6 py-4 text-center border border-brand-green/20">
                <h3 className="text-xl font-bold text-brand-green">For Freelancers</h3>
              </div>
            </AnimatedSection>

            <ol className="flex flex-col gap-12 relative">
              {freelancerSteps.map((step, i) => (
                <li key={step.title} className="relative z-10">
                  <AnimatedSection animation="slideInRight" delay={i * 100}>
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:text-left text-center">
                      <div className="relative shrink-0">
                        <div className="flex size-16 items-center justify-center rounded-xl bg-gradient-to-br from-brand-green to-brand text-primary-foreground shadow-brand">
                          <step.icon className="size-8" />
                        </div>
                        <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border-2 border-background bg-foreground text-xs font-bold text-background">
                          {i + 1}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold">{step.title}</h4>
                        <p className="mt-1 text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </AnimatedSection>
                </li>
              ))}
              {/* Connector line */}
              <div
                aria-hidden
                className="absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-brand-green/60 to-transparent hidden sm:block -z-10"
              />
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
