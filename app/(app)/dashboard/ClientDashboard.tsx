import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Briefcase,
  FileText,
  DollarSign,
  Clock,
  ChevronRight,
  TrendingUp,
  Inbox,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type ClientDashboardProps = {
  user: { name?: string | null };
  stats: {
    totalProjects: number;
    activeProjects: number;
    proposalsAwaitingReview: number;
    activeContracts: number;
    totalSpent: number;
  };
  proposals: any[];
  notifications: any[];
  contracts: any[];
};

export function ClientDashboard({
  user,
  stats,
  proposals,
  notifications,
  contracts,
}: ClientDashboardProps) {
  // Empty State for brand new clients
  if (stats.totalProjects === 0) {
    return (
      <div className="min-h-screen bg-muted/40 pt-20">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="text-center py-20 px-4 bg-card rounded-2xl border border-dashed">
            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand">
              <Briefcase className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Welcome to SkillSync!</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              You haven't posted any projects yet. Post your first project to start receiving proposals from top freelancers.
            </p>
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link href="/post-project">
                <PlusCircle className="w-5 h-5 mr-2" /> Post a Project
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: "Active Projects", value: stats.activeProjects.toString(), icon: Briefcase, color: "text-brand", bg: "bg-brand/10" },
    { label: "Awaiting Review", value: stats.proposalsAwaitingReview.toString(), icon: Inbox, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30" },
    { label: "Active Contracts", value: stats.activeContracts.toString(), icon: FileText, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
    { label: "Total Spent", value: `$${stats.totalSpent.toLocaleString()}`, icon: DollarSign, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800" },
  ];

  return (
    <div className="min-h-screen bg-muted/40 pt-20">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back, {user.name || "Client"}</h1>
            <p className="text-muted-foreground text-sm mt-1">Here's what's happening across your projects.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/post-project"><PlusCircle className="w-4 h-4 mr-2" /> Post Project</Link>
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
            
            {/* Needs Your Attention (Pending Proposals) */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-foreground">Needs Your Attention</h3>
              </div>
              
              {proposals.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No new proposals awaiting your review.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {proposals.map((proposal) => (
                    <div key={proposal._id.toString()} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-accent/50 transition-colors">
                      <Avatar className="w-10 h-10 border">
                        <AvatarImage src={proposal.freelancer?.image || ""} />
                        <AvatarFallback><Users className="w-5 h-5 text-muted-foreground" /></AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {proposal.freelancer?.name || "A freelancer"} applied for{" "}
                          <span className="font-semibold text-brand">
                            {proposal.project?.title || "your project"}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2 mt-3 sm:mt-0">
                        <div className="text-right mr-3">
                          <p className="text-sm font-bold text-foreground">
                            ${proposal.bidAmount}
                          </p>
                          <p className="text-xs text-muted-foreground">Bid</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/projects/${proposal.projectId.toString()}/proposals`}>Review</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Contracts Strip */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted/20">
                <h3 className="font-semibold text-foreground">Active Contracts</h3>
              </div>
              
              {contracts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No active contracts. Hire a freelancer to get started.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {contracts.map((contract) => (
                    <Link
                      key={contract._id.toString()}
                      href={`/contracts/${contract._id.toString()}`}
                      className="flex items-center justify-between p-6 hover:bg-accent/50 transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-brand transition-colors">
                          {contract.title || "Contract"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Freelancer: {contract.freelancer?.name || "Unknown"}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* Payment Status Chip */}
                        <div className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium border",
                          contract.paymentStatus === "paid" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                          contract.paymentStatus === "pending" && "bg-amber-50 text-amber-700 border-amber-200",
                          contract.paymentStatus === "refunded" && "bg-slate-100 text-slate-700 border-slate-200"
                        )}>
                          {contract.paymentStatus === "paid" ? "Paid" : 
                           contract.paymentStatus === "refunded" ? "Refunded" : 
                           "Payment Pending"}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            
            {/* Quick Actions */}
            <div className="rounded-xl border bg-card shadow-sm p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  { label: "Post a Project", href: "/post-project", icon: PlusCircle },
                  { label: "Find Freelancers", href: "/search", icon: Users }, // Assuming /search is for finding freelancers or projects
                  { label: "View My Projects", href: "/client/projects", icon: Briefcase },
                  { label: "View Contracts", href: "/contracts", icon: FileText },
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
                    <div key={notification._id.toString()} className="px-6 py-4 flex items-start gap-3 hover:bg-accent/50 transition-colors">
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
