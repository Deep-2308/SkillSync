"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  FileText,
  MessageSquare,
  Settings,
  Plus,
  TrendingUp,
  DollarSign,
  Users,
  Star,
  Clock,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                 Mock Data                                  */
/* -------------------------------------------------------------------------- */

const sparklineData = [
  { v: 30 }, { v: 45 }, { v: 35 }, { v: 50 }, { v: 48 }, { v: 60 }, { v: 55 }, { v: 70 }, { v: 65 }, { v: 80 }, { v: 78 }, { v: 90 },
];

const clientStats = [
  { label: "Posted Projects", value: "12", icon: Briefcase, color: "text-brand", bg: "bg-brand/10" },
  { label: "Active Contracts", value: "3", icon: FileText, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
  { label: "Total Spent", value: "$4,280", icon: DollarSign, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30" },
  { label: "Saved Freelancers", value: "8", icon: Star, color: "text-brand-green", bg: "bg-brand-green/10" },
];

const freelancerStats = [
  { label: "My Skills", value: "5", icon: Sparkles, color: "text-brand", bg: "bg-brand/10" },
  { label: "Proposals", value: "18", icon: FileText, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
  { label: "Active Contracts", value: "4", icon: Briefcase, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30" },
  { label: "Total Earnings", value: "$12,450", icon: DollarSign, color: "text-brand-green", bg: "bg-brand-green/10" },
];

const recentActivity = [
  { text: "New proposal received for 'Landing Page Redesign'", time: "2 hours ago", type: "proposal" },
  { text: "Contract with Alex M. completed successfully", time: "5 hours ago", type: "contract" },
  { text: "Payment of $850 processed", time: "1 day ago", type: "payment" },
  { text: "New message from Sarah K.", time: "1 day ago", type: "message" },
  { text: "Profile views increased by 23% this week", time: "2 days ago", type: "insight" },
  { text: "You received a 5-star review", time: "3 days ago", type: "review" },
];

const sidebarLinks = [
  { label: "Overview", icon: LayoutDashboard, id: "overview" },
  { label: "Projects", icon: Briefcase, id: "projects" },
  { label: "Skills", icon: Sparkles, id: "skills" },
  { label: "Contracts", icon: FileText, id: "contracts" },
  { label: "Messages", icon: MessageSquare, id: "messages" },
  { label: "Settings", icon: Settings, id: "settings" },
];

/* -------------------------------------------------------------------------- */
/*                              Sparkline Chart                               */
/* -------------------------------------------------------------------------- */

function Sparkline({ color = "#1D4ED8" }: { color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={50}>
      <AreaChart data={sparklineData}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} fill={`url(#grad-${color})`} strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export function DashboardClient() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const isFreelancer = user?.role === "freelancer";
  const stats = isFreelancer ? freelancerStats : clientStats;
  const sparkColors = ["#1D4ED8", "#10B981", "#F59E0B", "#1D4ED8"];

  return (
    <div className="min-h-screen bg-muted/40 pt-20">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-60 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-1">
              {/* User greeting */}
              <div className="p-4 rounded-xl border bg-card mb-4">
                <p className="text-sm text-muted-foreground">Welcome back,</p>
                <p className="font-semibold text-foreground truncate">{user?.name || "User"}</p>
                <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-brand/10 text-brand font-medium">
                  {isFreelancer ? "Freelancer" : "Client"}
                </span>
              </div>

              <nav className="space-y-1">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.id}
                      onClick={() => setActiveTab(link.id)}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        activeTab === link.id
                          ? "bg-brand/10 text-brand"
                          : "text-muted-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground text-sm">Here&apos;s what&apos;s happening with your account</p>
              </div>
              <div className="flex gap-3">
                {isFreelancer ? (
                  <Button asChild>
                    <Link href="/share-skill"><Plus className="w-4 h-4 mr-1" /> Share Skill</Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href="/post-project"><Plus className="w-4 h-4 mr-1" /> Post Project</Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="p-5 rounded-xl border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bg)}>
                        <Icon className={cn("w-5 h-5", stat.color)} />
                      </div>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <div className="mt-3">
                      <Sparkline color={sparkColors[index]} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Activity + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activity Feed */}
              <div className="lg:col-span-2 rounded-xl border bg-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Recent Activity</h3>
                </div>
                <div className="divide-y divide-border">
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="px-6 py-4 flex items-start gap-3 hover:bg-accent transition-colors">
                      <div className="w-2 h-2 rounded-full bg-brand mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground/80">{activity.text}</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-xl border bg-card p-6">
                <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {(isFreelancer
                    ? [
                        { label: "Share a New Skill", href: "/share-skill" },
                        { label: "View Proposals", href: "/dashboard" },
                        { label: "Update Profile", href: "/profile" },
                        { label: "Browse Projects", href: "/hire-talent" },
                      ]
                    : [
                        { label: "Post a Project", href: "/post-project" },
                        { label: "Browse Talent", href: "/hire-talent" },
                        { label: "View Contracts", href: "/dashboard" },
                        { label: "Update Profile", href: "/profile" },
                      ]
                  ).map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
                    >
                      <span className="text-sm font-medium text-foreground/80">{action.label}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
