"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Briefcase,
  FileText,
  DollarSign,
  Clock,
  ChevronRight,
  TrendingUp,
  Star,
  PlusCircle,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { EarningsChart } from "./EarningsChart";
import { SmartProjectMatchesPanel } from "./SmartProjectMatchesPanel";

type FreelancerDashboardProps = {
  user: { name?: string | null };
  stats: {
    activeContracts: number;
    pendingProposals: number;
    totalEarnings: number;
    averageRating: number;
  };
  proposalPipeline: {
    pending: number;
    accepted: number;
    rejected: number;
    withdrawn: number;
  };
  earningsSnapshot: { month: number; year: number; total: number }[];
  recommendedProjects: any[];
  recentReviews: any[];
  notifications: any[];
};

export function FreelancerDashboard({
  user,
  stats,
  proposalPipeline,
  earningsSnapshot,
  recommendedProjects,
  recentReviews,
  notifications,
}: FreelancerDashboardProps) {
  
  // Empty State for brand new freelancers
  if (stats.activeContracts === 0 && stats.pendingProposals === 0 && recommendedProjects.length === 0) {
    return (
      <div className="min-h-screen bg-muted/40 pt-20">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="text-center py-20 px-4 bg-card rounded-2xl border border-dashed">
            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand">
              <Search className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Welcome to SkillSync!</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              You haven't submitted any proposals yet. Start browsing projects and submit your first bid.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild className="h-12 px-8 text-base">
                <Link href="/freelancer/find-work">
                  <Search className="w-5 h-5 mr-2" /> Find Work
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
                <Link href="/freelancer/gigs/new">
                  <PlusCircle className="w-5 h-5 mr-2" /> Create Gig
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: "Active Contracts", value: stats.activeContracts.toString(), icon: Briefcase, color: "text-brand", bg: "bg-brand/10" },
    { label: "Pending Proposals", value: stats.pendingProposals.toString(), icon: FileText, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30" },
    { label: "Total Earned", value: `$${stats.totalEarnings.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
    { label: "Average Rating", value: stats.averageRating.toFixed(1), icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="min-h-screen bg-muted/40 pt-20">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back, {user.name?.split(' ')[0] || "Freelancer"}</h1>
            <p className="text-muted-foreground text-sm mt-1">Here's your business overview.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/freelancer/find-work"><Search className="w-4 h-4 mr-2" /> Find Work</Link>
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((stat) => {
            const Icon = stat.icon;
            return (
               <div key={stat.label} className="p-5 rounded-xl border bg-card shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
                    <Icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-muted-foreground opacity-50" />
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Earnings Chart */}
            <div className="rounded-xl border bg-card shadow-sm p-6">
              <h3 className="font-semibold text-foreground mb-6">Earnings Snapshot</h3>
              <EarningsChart data={earningsSnapshot} />
            </div>

            {/* Recommended for you */}
            <SmartProjectMatchesPanel />

            {/* Recent Reviews */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted/20">
                <h3 className="font-semibold text-foreground">Recent Reviews</h3>
              </div>
              
              {recentReviews.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No reviews yet. Complete contracts to earn reviews!
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="p-6 hover:bg-accent/50 transition-colors group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 border">
                            <AvatarImage src={review.reviewerId?.image || ""} />
                            <AvatarFallback><Users className="w-4 h-4 text-muted-foreground" /></AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{review.reviewerId?.name || "Client"}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2 py-1 rounded-md text-xs font-medium">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {review.rating.toFixed(1)}
                        </div>
                      </div>
                      <p className="text-sm text-foreground/80 italic">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            
            {/* Proposal Pipeline */}
            <div className="rounded-xl border bg-card shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Proposal Pipeline</h3>
                <Link href="/freelancer/proposals" className="text-sm text-brand font-medium hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border">
                  <div className="flex items-center gap-3 text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <span className="font-bold">{proposalPipeline.pending}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-3 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Accepted</span>
                  </div>
                  <span className="font-bold">{proposalPipeline.accepted}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-rose-50/50 rounded-lg border border-rose-100">
                  <div className="flex items-center gap-3 text-rose-600">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Rejected</span>
                  </div>
                  <span className="font-bold">{proposalPipeline.rejected}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                  <div className="flex items-center gap-3 text-slate-500">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Withdrawn</span>
                  </div>
                  <span className="font-bold">{proposalPipeline.withdrawn}</span>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="rounded-xl border bg-card shadow-sm p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  { label: "Create a Gig", href: "/freelancer/gigs/new", icon: PlusCircle },
                  { label: "My Gigs", href: "/freelancer/gigs", icon: Briefcase },
                  { label: "Update Profile", href: "/settings/profile", icon: Users },
                  { label: "My Contracts", href: "/contracts", icon: FileText },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent hover:border-brand/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-brand transition-colors" />
                      <span className="text-sm font-medium text-foreground/80">{action.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity Feed (Notifications) */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted/20">
                <h3 className="font-semibold text-foreground">Recent Activity</h3>
              </div>
              
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No recent activity.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="px-6 py-4 flex items-start gap-3 hover:bg-accent/50 transition-colors">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        !notification.read ? "bg-brand" : "bg-muted-foreground/30"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm", !notification.read ? "text-foreground font-medium" : "text-foreground/80")}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
