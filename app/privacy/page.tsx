"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  { id: "collection", title: "1. Data We Collect" },
  { id: "use", title: "2. How We Use Your Data" },
  { id: "sharing", title: "3. Data Sharing" },
  { id: "cookies", title: "4. Cookies & Tracking" },
  { id: "rights", title: "5. Your Rights" },
  { id: "security", title: "6. Security" },
  { id: "contact", title: "7. Contact Us" },
];

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState("collection");
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
          <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: July 1, 2026</p>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-6 py-12 flex gap-12">
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

        <article className="flex-1 prose dark:prose-invert max-w-none prose-headings:scroll-mt-24">
          <section id="collection">
            <h2>1. Data We Collect</h2>
            <p>We collect information you provide directly when creating an account, posting a project, or communicating through the Platform:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, password, profile photo, and role (Client or Freelancer).</li>
              <li><strong>Profile Data:</strong> Skills, bio, portfolio links, hourly rate, and availability status.</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, search queries, device information, and IP address.</li>
              <li><strong>Payment Data:</strong> Billing address and payment method details (processed by our secure payment partner — we never store full card numbers).</li>
            </ul>
          </section>

          <section id="use">
            <h2>2. How We Use Your Data</h2>
            <p>We use the collected data to:</p>
            <ul>
              <li>Provide, maintain, and improve the Platform.</li>
              <li>Match Clients with relevant Freelancers using our AI algorithm.</li>
              <li>Process payments and prevent fraud.</li>
              <li>Send transactional emails (confirmations, notifications) and — with your consent — marketing communications.</li>
              <li>Generate anonymized, aggregated analytics to improve user experience.</li>
            </ul>
          </section>

          <section id="sharing">
            <h2>3. Data Sharing</h2>
            <p>We do not sell your personal data. We share data only in the following circumstances:</p>
            <ul>
              <li><strong>With other users:</strong> Your public profile information is visible to other SkillSync users.</li>
              <li><strong>Service providers:</strong> We share data with trusted third parties who help us operate the Platform (hosting, analytics, email delivery).</li>
              <li><strong>Legal obligations:</strong> We may disclose data when required by law, regulation, or legal process.</li>
              <li><strong>Business transfers:</strong> In the event of a merger, acquisition, or sale of assets, user data may be transferred.</li>
            </ul>
          </section>

          <section id="cookies">
            <h2>4. Cookies & Tracking</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li><strong>Essential cookies:</strong> Required for authentication, security, and core functionality.</li>
              <li><strong>Analytics cookies:</strong> Help us understand how users interact with the Platform (e.g., Vercel Analytics).</li>
              <li><strong>Preference cookies:</strong> Remember your settings like theme preference (light/dark mode).</li>
            </ul>
            <p>You can manage cookie preferences through our cookie consent banner or your browser settings. Note that disabling essential cookies may affect Platform functionality.</p>
          </section>

          <section id="rights">
            <h2>5. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Update or correct inaccurate data.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data (&quot;right to be forgotten&quot;).</li>
              <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format.</li>
              <li><strong>Objection:</strong> Object to processing of your data for certain purposes.</li>
            </ul>
            <p>To exercise any of these rights, contact us at privacy@skillsync.com.</p>
          </section>

          <section id="security">
            <h2>6. Security</h2>
            <p>We implement industry-standard security measures to protect your data:</p>
            <ul>
              <li>All data transmitted between your browser and our servers is encrypted using TLS 1.3.</li>
              <li>Passwords are hashed using bcrypt with a high work factor.</li>
              <li>We conduct regular security audits and penetration testing.</li>
              <li>Access to personal data is restricted to authorized personnel on a need-to-know basis.</li>
            </ul>
            <p>While we strive to protect your data, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.</p>
          </section>

          <section id="contact">
            <h2>7. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
            <ul>
              <li><strong>Email:</strong> privacy@skillsync.com</li>
              <li><strong>Address:</strong> SkillSync Inc., 123 Innovation Drive, San Francisco, CA 94102</li>
            </ul>
          </section>
        </article>
      </div>

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
