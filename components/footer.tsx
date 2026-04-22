import Link from "next/link"
import { Sparkles } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background relative overflow-hidden">
      {/* Decorative gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      {/* Background mesh */}
      <div className="absolute inset-0 bg-mesh opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-display text-xl font-bold text-gradient-brand">SkillSync</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Smart freelancer hiring and review platform. Connect with top talent through
              AI-powered matching, secure payments, and verified reviews.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-mono text-[11px] tracking-[0.15em] uppercase text-primary/70 mb-5">
              Navigation
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/services", label: "Services" },
                { href: "/hire-talent", label: "Hire Talent" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-mono text-[11px] tracking-[0.15em] uppercase text-primary/70 mb-5">
              Legal
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[11px] text-muted-foreground tracking-wider">
            © 2024 SKILLSYNC. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8">
            {["LinkedIn", "Twitter", "GitHub"].map((s) => (
              <a
                key={s}
                href="#"
                className="font-mono text-[11px] text-muted-foreground hover:text-primary transition-colors tracking-wider uppercase"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
