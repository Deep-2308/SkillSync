import Link from "next/link";
import { Github, Instagram, Linkedin, Twitter } from "lucide-react";

import { Logo } from "@/components/logo";

/**
 * Site footer. Server Component — no interactivity, so it stays out of the
 * client bundle. The copyright year is computed at render time.
 */

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Hire Talent", href: "/explore" },
  { label: "Post Project", href: "/projects/new" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

const socialLinks = [
  { label: "X (Twitter)", href: "https://twitter.com/skillsync", icon: Twitter },
  { label: "LinkedIn", href: "https://linkedin.com/company/skillsync", icon: Linkedin },
  { label: "GitHub", href: "https://github.com/skillsync", icon: Github },
  { label: "Instagram", href: "https://instagram.com/skillsync", icon: Instagram },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t">
      {/* Gradient hairline along the top border. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand to-brand-green opacity-70"
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        {/* 1 col (mobile) → 2 col (tablet) → 4 col (desktop) */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="text-sm font-medium">Share skills. Hire talent.</p>
            <p className="text-muted-foreground max-w-xs text-sm">
              SkillSync connects businesses with vetted freelance professionals
              — hire with confidence, backed by secure payments and real reviews.
            </p>
          </div>

          {/* Quick links */}
          <FooterColumn title="Quick Links">
            {quickLinks.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          {/* Legal */}
          <FooterColumn title="Legal">
            {legalLinks.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          {/* Social */}
          <FooterColumn title="Follow Us">
            <ul className="flex gap-2">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-muted-foreground hover:text-foreground hover:border-brand flex size-9 items-center justify-center rounded-md border transition-colors"
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </FooterColumn>
        </div>

        <div className="text-muted-foreground mt-12 border-t pt-6 text-center text-sm">
          © {year} SkillSync. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}
