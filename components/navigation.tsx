"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User as UserIcon,
} from "lucide-react";

import { cn, getInitials } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { mainNavLinks, userMenuLinks, visibleNavLinks } from "@/data/nav-links";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Sticky top navigation.
 *
 * - Glass-morphism: once the page is scrolled past a threshold the bar gains a
 *   semi-transparent background + backdrop blur; at the very top it's flush.
 * - Auth-aware: reads `useAuth()`; shows Login/Get Started when signed out and
 *   an avatar dropdown when signed in.
 * - Role-gated links (e.g. "Share Skill") are filtered via visibleNavLinks().
 */
export function Navigation() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const scrolled = useScrolled(8);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Close the mobile drawer whenever the route changes.
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const links = visibleNavLinks(mainNavLinks, user?.role ?? null);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b bg-background/70 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <NavItem
                href={link.href}
                label={link.label}
                active={isActivePath(pathname, link.href)}
              />
            </li>
          ))}
        </ul>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isAuthenticated && user ? (
            <UserMenu
              name={user.name}
              email={user.email}
              image={user.image}
            />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile hamburger → right-side drawer */}
          <MobileMenu
            open={mobileOpen}
            onOpenChange={setMobileOpen}
            links={links}
            pathname={pathname}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </nav>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Desktop pieces                               */
/* -------------------------------------------------------------------------- */

function NavItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
      {/* Active underline in brand blue. */}
      <span
        className={cn(
          "absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand transition-transform duration-300",
          active ? "scale-x-100" : "scale-x-0"
        )}
      />
    </Link>
  );
}

function UserMenu({
  name,
  email,
  image,
}: {
  name: string;
  email: string;
  image: string | null;
}) {
  const { signOut } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="focus-visible:ring-ring rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label="Open user menu"
        >
          <Avatar className="size-9">
            {/* Radix needs to own the <img> load lifecycle to swap in the
                fallback on error, so we use AvatarImage directly rather than
                next/image via asChild. Avatar hosts are allowlisted in
                next.config.mjs regardless. */}
            {image ? <AvatarImage src={image} alt={name} /> : null}
            <AvatarFallback>{getInitials(name || email)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate font-medium">{name}</span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserIcon />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={(event) => {
            // Prevent the menu's default focus-return so navigation isn't interrupted.
            event.preventDefault();
            void signOut();
          }}
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Mobile drawer                               */
/* -------------------------------------------------------------------------- */

function MobileMenu({
  open,
  onOpenChange,
  links,
  pathname,
  isAuthenticated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  links: { label: string; href: string }[];
  pathname: string;
  isAuthenticated: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle className="text-left">
            <Logo />
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 px-2">
          {links.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <SheetClose asChild key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {link.label}
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        {!isAuthenticated && (
          <div className="mt-auto flex flex-col gap-2 border-t p-4">
            <SheetClose asChild>
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                   */
/* -------------------------------------------------------------------------- */

/** Subscribe to window scroll and report whether we're past `threshold` px. */
function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll(); // initialize on mount (handles refresh mid-page)
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

/**
 * Active-link matching: exact match for "/", prefix match for everything else
 * so nested routes (e.g. /explore/123) still highlight their parent.
 */
function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
