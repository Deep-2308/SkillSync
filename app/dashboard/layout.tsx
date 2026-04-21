"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { LayoutDashboard, UserCircle, Briefcase, ExternalLink, FolderOpen, MessageCircle } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const sidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Edit Profile", icon: UserCircle },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/dashboard/projects", label: "My Projects", icon: FolderOpen },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 shrink-0">
              <div className="sticky top-24 space-y-2">
                <div className="mb-6 px-3">
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary/60 block mb-1">
                    Dashboard
                  </span>
                  <p className="text-sm text-muted-foreground font-serif italic truncate">
                    {user?.name || "User"}
                  </p>
                </div>

                <nav className="space-y-1">
                  {sidebarLinks.map((link) => {
                    const isActive = pathname === link.href
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    )
                  })}
                </nav>

                {user?.username && (
                  <div className="pt-4 mt-4 border-t border-border/40">
                    <Link
                      href={`/u/${user.username}`}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-primary transition-colors font-mono"
                      target="_blank"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Public Profile
                    </Link>
                  </div>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
