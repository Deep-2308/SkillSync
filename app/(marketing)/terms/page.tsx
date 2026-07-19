"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sections = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "description", title: "2. Description of Service" },
  { id: "accounts", title: "3. User Accounts" },
  { id: "payments", title: "4. Payments & Fees" },
  { id: "ip", title: "5. Intellectual Property" },
  { id: "prohibited", title: "6. Prohibited Conduct" },
  { id: "limitation", title: "7. Limitation of Liability" },
  { id: "governing", title: "8. Governing Law" },
];

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState("acceptance");
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      for (const section of [...sections].reverse()) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <section className="pt-32 pb-12 px-6 bg-muted/40 border-b border-border">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: July 1, 2026</p>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-6 py-12 flex gap-12">
        {/* Sticky ToC sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <nav className="sticky top-24 space-y-1">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">On this page</p>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cn(
                  "block text-sm py-1.5 px-3 rounded-md transition-colors",
                  activeSection === s.id
                    ? "bg-brand/10 text-brand font-medium"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <article className="flex-1 prose dark:prose-invert max-w-none prose-headings:scroll-mt-24">
          <section id="acceptance">
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using SkillSync (&quot;the Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to all of these Terms, do not use the Platform.</p>
            <p>We reserve the right to update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the updated Terms. We will notify registered users of material changes via email or in-app notification.</p>
          </section>

          <section id="description">
            <h2>2. Description of Service</h2>
            <p>SkillSync is an online marketplace that connects individuals seeking services (&quot;Clients&quot;) with skilled professionals (&quot;Freelancers&quot;). The Platform facilitates the discovery, hiring, and payment process but does not itself provide any professional services.</p>
            <p>SkillSync acts as an intermediary and is not a party to any agreement between Clients and Freelancers. All work arrangements, deliverables, and timelines are agreed upon directly between the parties involved.</p>
          </section>

          <section id="accounts">
            <h2>3. User Accounts</h2>
            <p>To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
            <ul>
              <li>You must provide accurate and complete registration information.</li>
              <li>You must be at least 18 years old to create an account.</li>
              <li>You may not transfer your account to another person.</li>
              <li>SkillSync reserves the right to suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </section>

          <section id="payments">
            <h2>4. Payments & Fees</h2>
            <p>SkillSync charges a service fee on each transaction completed through the Platform. The current fee structure is displayed at the time of transaction.</p>
            <p>Payments are processed through our secure payment partner. Funds are held in escrow until the Client confirms satisfactory completion of work. Freelancers receive payment within 5 business days of release from escrow.</p>
          </section>

          <section id="ip">
            <h2>5. Intellectual Property</h2>
            <p>Unless otherwise agreed in writing between Client and Freelancer, all intellectual property created during an engagement belongs to the Client upon full payment. Freelancers retain the right to display completed work in their portfolio unless restricted by a non-disclosure agreement.</p>
          </section>

          <section id="prohibited">
            <h2>6. Prohibited Conduct</h2>
            <p>Users may not:</p>
            <ul>
              <li>Use the Platform for any illegal or unauthorized purpose.</li>
              <li>Circumvent the Platform&apos;s payment system to avoid service fees.</li>
              <li>Harass, abuse, or threaten other users.</li>
              <li>Post false, misleading, or deceptive content.</li>
              <li>Attempt to gain unauthorized access to Platform systems or data.</li>
              <li>Use automated tools to scrape or interact with the Platform.</li>
            </ul>
          </section>

          <section id="limitation">
            <h2>7. Limitation of Liability</h2>
            <p>SkillSync is provided &quot;as is&quot; without warranties of any kind. To the fullest extent permitted by law, SkillSync shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.</p>
            <p>Our total liability shall not exceed the amount of service fees paid by you in the twelve (12) months preceding the claim.</p>
          </section>

          <section id="governing">
            <h2>8. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to conflict of law principles.</p>
            <p>Any disputes arising under these Terms shall be resolved through binding arbitration in San Francisco, California, in accordance with the rules of the American Arbitration Association.</p>
          </section>
        </article>
      </div>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "fixed bottom-8 right-8 w-12 h-12 rounded-full bg-brand text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-brand/90",
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
