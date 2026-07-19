"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Search,
  Inbox,
  FileSignature,
  MessageSquare,
  CreditCard,
  Settings,
  HelpCircle,
  Briefcase,
  DollarSign,
  Menu,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

type Role = "client" | "freelancer" | "admin";

interface SidebarProps {
  role: string | null | undefined;
}

const clientNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Projects", href: "/my-projects", icon: FolderKanban },
  { title: "Find Freelancers", href: "/hire-talent", icon: Search },
  { title: "Proposals Received", href: "/proposals", icon: Inbox },
  { title: "Contracts", href: "/contracts", icon: FileSignature },
  { title: "Messages", href: "/messages", icon: MessageSquare },
  { title: "Payments", href: "/payments", icon: CreditCard },
];

const freelancerNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Find Work", href: "/find-work", icon: Search },
  { title: "My Gigs", href: "/my-gigs", icon: Briefcase },
  { title: "My Proposals", href: "/my-proposals", icon: Inbox },
  { title: "Contracts", href: "/contracts", icon: FileSignature },
  { title: "Messages", href: "/messages", icon: MessageSquare },
  { title: "Earnings", href: "/earnings", icon: DollarSign },
];

const sharedNav = [
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  // Safely default to client if role is unexpected or missing
  const isFreelancer = role === "freelancer";
  const primaryNav = isFreelancer ? freelancerNav : clientNav;

  const NavContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo className="h-6 w-auto" />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
        {primaryNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand/10 text-brand"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-brand" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-4">
        <nav className="space-y-1 border-t pt-4">
          {sharedNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand/10 text-brand"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-brand" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-muted/10 md:block">
        <NavContent />
      </aside>

      {/* Mobile Drawer */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <NavContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
