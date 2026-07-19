"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Crown, Loader2, ShieldCheck, Star, Zap } from "lucide-react";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { ShareSkillForm } from "./ShareSkillForm";

function FreelancerOnlyPrompt() {
  return (
    <main className="min-h-screen bg-muted/40 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-brand-green flex items-center justify-center shadow-lg">
          <Crown className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            For Freelancers Only
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Skill listings are how freelancers offer their services on SkillSync.
            Your account is registered as a Client — clients hire talent and post
            projects instead.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            { icon: Star, title: "Offer Services", desc: "Freelancers showcase their work" },
            { icon: Zap, title: "Get Matched", desc: "AI connects talent to clients" },
            { icon: ShieldCheck, title: "Pay Securely", desc: "Protected payments" },
          ].map((perk) => {
            const Icon = perk.icon;
            return (
              <div key={perk.title} className="flex flex-col items-center p-4 rounded-xl border bg-card">
                <Icon className="w-8 h-8 text-brand mb-3" />
                <h3 className="font-semibold text-sm text-foreground">{perk.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{perk.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <Link href="/post-project">
              Post a Project Instead <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

function ShareSkillContent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  // Skill listings are freelancer-only; clients are pointed to project posting.
  if (session?.user?.role === "client") {
    return <FreelancerOnlyPrompt />;
  }

  return (
    <main className="min-h-screen bg-muted/40 pt-24 pb-16 px-4 sm:px-6">
      <ShareSkillForm />
    </main>
  );
}

export default function ShareSkillPage() {
  return (
    <ProtectedRoute>
      <ShareSkillContent />
    </ProtectedRoute>
  );
}
