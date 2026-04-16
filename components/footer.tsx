import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      {/* Decorative gold line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="font-display text-xl text-primary mb-4 block tracking-tight hover:opacity-80 transition-opacity">
              SkillSync
            </Link>
            <p className="font-serif text-sm text-muted-foreground leading-relaxed max-w-sm italic">
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
                { href: "/about", label: "About" },
                { href: "/services", label: "Services" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-serif text-sm text-muted-foreground hover:text-foreground transition-colors"
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
                <Link href="/terms" className="font-serif text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="font-serif text-sm text-muted-foreground hover:text-foreground transition-colors">
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
