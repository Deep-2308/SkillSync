import type { UserRole } from "@/types";

/**
 * Shared navigation link definitions consumed by both the desktop nav and the
 * mobile drawer, so the two never drift out of sync.
 */
export interface NavLink {
  label: string;
  href: string;
  /**
   * If set, the link only renders when the current user has this role.
   * `undefined` means "always visible".
   */
  requiredRole?: UserRole;
}

/** Primary marketing/app navigation. */
export const mainNavLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Hire Talent", href: "/hire-talent" },
  { label: "Post Project", href: "/post-project" },
  { label: "Contact", href: "/contact" },
  // "Share Skill" is freelancer-only.
  { label: "Share Skill", href: "/share-skill", requiredRole: "freelancer" },
];

/** Links inside the authenticated user dropdown. */
export const userMenuLinks: Omit<NavLink, "requiredRole">[] = [
  { label: "Profile", href: "/profile" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Settings", href: "/settings" },
];

/**
 * Filter nav links by the viewer's role. A link with no `requiredRole` is
 * always visible; a role-gated link needs an exact role match.
 */
export function visibleNavLinks(
  links: NavLink[],
  role: UserRole | null
): NavLink[] {
  return links.filter((link) => !link.requiredRole || link.requiredRole === role);
}
