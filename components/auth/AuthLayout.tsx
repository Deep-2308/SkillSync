import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Decorative Panel */}
      <div className="hidden md:flex flex-col justify-between bg-zinc-900 text-zinc-50 p-10 relative overflow-hidden">
        {/* Abstract shapes / decorations */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-500 rounded-full blur-[128px] opacity-20" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-500 rounded-full blur-[128px] opacity-20" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <Logo />
          </div>
          
          <div className="space-y-6 mt-24">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Master your craft. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Accelerate your career.
              </span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-md">
              Join a community of experts and learners. SkillSync connects you with the resources and mentorship you need to thrive.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm text-zinc-400">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800" />
            ))}
          </div>
          <p>Over 10,000+ professionals</p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 md:p-16 bg-white dark:bg-zinc-950">
        <div className="w-full max-w-md space-y-8">
          <div className="md:hidden">
            <div className="flex items-center gap-2 mb-8">
              <Logo />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Welcome to SkillSync</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h2>
            <p className="text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
