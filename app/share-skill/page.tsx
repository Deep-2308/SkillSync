"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Crown, Loader2, ShieldCheck, Star, Zap } from "lucide-react";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { ShareSkillForm } from "./ShareSkillForm";

function ExpertUpgradePrompt() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
          <Crown className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Become an Expert
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            Upgrade your account to an Expert role to share your skills, get hired, and earn money on SkillSync.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            { icon: Star, title: "Share Skills", desc: "Showcase your expertise" },
            { icon: Zap, title: "Get Matched", desc: "AI connects you to clients" },
            { icon: ShieldCheck, title: "Earn Securely", desc: "Protected payments" },
          ].map((perk) => {
            const Icon = perk.icon;
            return (
              <div key={perk.title} className="flex flex-col items-center p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <Icon className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">{perk.title}</h3>
                <p className="text-xs text-zinc-500 mt-1">{perk.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
            Upgrade to Expert <ArrowRight className="w-4 h-4 ml-2" />
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
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </main>
    );
  }

  // If user is a member (learner), show upgrade prompt
  if (session?.user?.role === "member") {
    return <ExpertUpgradePrompt />;
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 pb-16 px-4 sm:px-6">
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
