"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, Sun, Moon, LayoutDashboard, ExternalLink } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/context/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/hire-talent", label: "Hire Talent" },
  { href: "/post-project", label: "Post Project" },
  { href: "/contact", label: "Contact" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by waiting for mount to render theme toggle
  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="font-display text-xl tracking-tight text-primary hover:opacity-80 transition-opacity">
            SkillSync
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="link-underline text-muted-foreground hover:text-foreground px-3 py-2 text-sm tracking-wide transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && user?.role === "expert" && (
              <Link
                href="/share-skill"
                className="link-underline text-muted-foreground hover:text-foreground px-3 py-2 text-sm tracking-wide transition-colors"
              >
                Share Skill
              </Link>
            )}
          </div>

          {/* Action Area (Theme & Auth) */}
          <div className="hidden md:flex items-center gap-3">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}
            
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-border hover:border-primary/40 transition-colors">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/avatars/01.png" alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-mono">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs font-mono text-primary capitalize">{user.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {user.username && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href={`/u/${user.username}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Public Profile
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" className="btn-glow text-sm" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-muted-foreground hover:text-foreground p-2 transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border/40 pb-4">
            <div className="pt-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2.5 text-muted-foreground hover:text-foreground text-sm transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && user?.role === "expert" && (
                <Link
                  href="/share-skill"
                  className="block px-3 py-2.5 text-muted-foreground hover:text-foreground text-sm transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Share Skill
                </Link>
              )}
              <div className="pt-4 px-3 border-t border-border/40 mt-3">
                <div className="mb-4">
                  {mounted && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                    </Button>
                  )}
                </div>
                {isAuthenticated && user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-mono">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs font-mono text-primary capitalize">{user.role}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="w-full" onClick={() => setIsOpen(false)}>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                      </Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={logout} className="w-full">
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" asChild><Link href="/login">Login</Link></Button>
                    <Button size="sm" className="btn-glow" asChild><Link href="/signup">Sign Up</Link></Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom gold accent line */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </nav>
  )
}
