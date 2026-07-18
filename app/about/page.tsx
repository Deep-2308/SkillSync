"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Globe,
  Heart,
  Linkedin,
  Lightbulb,
  Shield,
  Target,
  Users,
  Zap,
  Clock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/animated-section";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                             useCountUp hook                                */
/* -------------------------------------------------------------------------- */

function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutQuart for a satisfying deceleration
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

/* -------------------------------------------------------------------------- */
/*                                  Data                                      */
/* -------------------------------------------------------------------------- */

const stats = [
  { label: "Users", value: 50000, suffix: "+", icon: Users },
  { label: "Projects", value: 25000, suffix: "+", icon: Target },
  { label: "Avg Rating", value: 4.9, suffix: "", icon: Star, isDecimal: true },
  { label: "Countries", value: 12, suffix: "", icon: Globe },
];

const team = [
  { name: "Aditi Sharma", role: "CEO & Founder", avatar: "AS" },
  { name: "James Wilson", role: "CTO", avatar: "JW" },
  { name: "Priya Patel", role: "Head of Design", avatar: "PP" },
  { name: "Marcus Chen", role: "Lead Engineer", avatar: "MC" },
];

const benefits = [
  { icon: Zap, title: "AI-Powered Matching", desc: "Our algorithm connects you with the perfect talent in seconds." },
  { icon: Shield, title: "Secure Payments", desc: "Escrow-protected transactions ensure you only pay for quality work." },
  { icon: Clock, title: "Fast Turnaround", desc: "Get matched and start your project within hours, not weeks." },
  { icon: Award, title: "Verified Experts", desc: "Every expert is vetted through our rigorous qualification process." },
  { icon: Heart, title: "24/7 Support", desc: "Our dedicated support team is always here to help you succeed." },
  { icon: Lightbulb, title: "Smart Insights", desc: "Data-driven recommendations to optimize your hiring decisions." },
];

const publications = ["TechCrunch", "Forbes", "Wired", "The Verge", "Product Hunt"];

/* -------------------------------------------------------------------------- */
/*                              Stat Card                                     */
/* -------------------------------------------------------------------------- */

function StatCard({ stat }: { stat: typeof stats[number] }) {
  const { count, ref } = useCountUp(stat.isDecimal ? Math.floor(stat.value * 10) : stat.value);
  const Icon = stat.icon;
  const display = stat.isDecimal ? (count / 10).toFixed(1) : count.toLocaleString();

  return (
    <div ref={ref} className="flex flex-col items-center p-6 text-center">
      <Icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-4" />
      <span className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50">
        {display}{stat.suffix}
      </span>
      <span className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 font-medium">{stat.label}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Page Component                                */
/* -------------------------------------------------------------------------- */

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] -z-10" />
        <div className="container mx-auto text-center max-w-3xl">
          <AnimatedSection>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6">
              Empowering Skills, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Connecting Talent
              </span>
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              SkillSync was built on a simple belief: everyone has a skill worth sharing, and every project deserves the right expert.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="py-24 px-6 bg-white dark:bg-zinc-900">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
          <AnimatedSection animation="slideInLeft">
            <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 h-full">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Our Mission</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                To democratize access to expertise by creating a global platform where skilled professionals and learners connect, collaborate, and grow together. We believe talent has no borders.
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection animation="slideInRight">
            <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 h-full">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mb-6">
                <Lightbulb className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Our Vision</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                A world where anyone can turn their expertise into opportunity, and every business — from startups to enterprises — can find the perfect talent in minutes, not months.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto max-w-4xl">
          <AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6 bg-white dark:bg-zinc-900">
        <div className="container mx-auto max-w-5xl">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Meet Our Team</h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
                A passionate group of builders, designers, and dreamers working to reshape how the world connects with talent.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <AnimatedSection key={member.name} delay={index * 100}>
                <div className="group flex flex-col items-center text-center p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:shadow-lg transition-all">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold mb-4">
                    {member.avatar}
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{member.name}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{member.role}</p>
                  <button className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" aria-label={`${member.name} LinkedIn`}>
                    <Linkedin className="w-5 h-5" />
                  </button>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Why SkillSync? */}
      <section className="py-24 px-6 bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto max-w-5xl">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Why SkillSync?</h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
                We&apos;re not just another freelancing platform — we&apos;re building the future of work.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <AnimatedSection key={benefit.title} delay={index * 80}>
                  <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow h-full">
                    <Icon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-4" />
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{benefit.desc}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured In */}
      <section className="py-16 px-6 bg-white dark:bg-zinc-900 border-y border-zinc-100 dark:border-zinc-800">
        <div className="container mx-auto max-w-4xl">
          <AnimatedSection>
            <p className="text-center text-sm font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-8">Featured In</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {publications.map((pub) => (
                <span key={pub} className="text-xl font-bold text-zinc-300 dark:text-zinc-700 hover:text-zinc-500 dark:hover:text-zinc-500 transition-colors cursor-default">
                  {pub}
                </span>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-indigo-600 dark:bg-indigo-900">
        <div className="container mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to join the SkillSync community?
            </h2>
            <p className="text-indigo-100 mb-10 max-w-2xl mx-auto text-lg">
              Whether you&apos;re looking to hire top talent or share your expertise with the world, SkillSync is the platform for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-indigo-900 hover:bg-zinc-100" asChild>
                <Link href="/signup">Get Started Free <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link href="/services">Explore Services</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
