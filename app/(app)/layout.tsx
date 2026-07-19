import Link from "next/link";
import { LayoutDashboard, FileText, Users, Share2, Settings, User } from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh">
      <aside className="w-64 border-r bg-muted/20 p-4">
        <nav className="space-y-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              SkillSync App
            </h2>
            <div className="space-y-1">
              <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link href="/post-project" className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <FileText className="h-4 w-4" />
                Post Project
              </Link>
              <Link href="/hire-talent" className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <Users className="h-4 w-4" />
                Hire Talent
              </Link>
              <Link href="/share-skill" className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <Share2 className="h-4 w-4" />
                Share Skill
              </Link>
              <Link href="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <User className="h-4 w-4" />
                Profile
              </Link>
              <Link href="/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </div>
          </div>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b flex items-center px-6">
          <div className="font-medium">Placeholder App Topbar</div>
        </header>
        <div className="p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
