import Link from "next/link";
import { LayoutDashboard, Users, Shield, Gavel, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | SkillSync",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="text-lg font-bold tracking-tight">Skillsync Admin</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">
            <LayoutDashboard className="w-5 h-5 text-muted-foreground" />
            Overview
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">
            <Users className="w-5 h-5 text-muted-foreground" />
            Users
          </Link>
          <Link href="/admin/content" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">
            <Shield className="w-5 h-5 text-muted-foreground" />
            Moderation
          </Link>
          <Link href="/admin/disputes" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">
            <Gavel className="w-5 h-5 text-muted-foreground" />
            Disputes
          </Link>
          <Link href="/admin/operations" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">
            <Settings className="w-5 h-5 text-muted-foreground" />
            Operations
          </Link>
        </nav>
        <div className="p-4 border-t">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center justify-between px-6">
          <div className="md:hidden font-bold">Skillsync Admin</div>
          <div className="flex-1" />
          <ThemeToggle />
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8 space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
