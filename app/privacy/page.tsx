import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AnimatedSection } from "@/components/animated-section"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-3xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="slideUp" delay={0}>
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-4 block">Legal</span>
          <h1 className="font-display text-4xl font-bold text-foreground mb-8 tracking-tight">Privacy Policy</h1>
          <p className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground mb-12">
            Last updated: April 2026
          </p>
        </AnimatedSection>

        <article className="space-y-8">
          {[
            {
              title: "1. Information We Collect",
              content:
                "We collect information you provide directly: name, email address, role preference, profile details, and project information. We also collect usage data such as pages visited, features used, and interaction patterns to improve our platform experience.",
            },
            {
              title: "2. How We Use Your Information",
              content:
                "Your information is used to provide and improve our services, process transactions, communicate with you about projects and platform updates, personalize your experience, match freelancers with projects using our AI algorithms, and ensure platform security.",
            },
            {
              title: "3. Information Sharing",
              content:
                "We do not sell your personal information. We share data only with: other platform users as necessary for project collaboration (e.g., your name and profile are visible to clients/freelancers), payment processors for transaction processing, and service providers who help us operate the platform.",
            },
            {
              title: "4. Data Security",
              content:
                "We implement industry-standard security measures to protect your data. Passwords are hashed using bcrypt encryption. Sessions are managed through secure HTTP-only cookies with JWT tokens. All data transmission is encrypted via HTTPS.",
            },
            {
              title: "5. Cookies & Sessions",
              content:
                "We use HTTP-only cookies to maintain your login session. These cookies are essential for the platform to function and cannot be opted out of while using the service. We do not use third-party tracking cookies.",
            },
            {
              title: "6. Data Retention",
              content:
                "We retain your account data for as long as your account is active. Project data, reviews, and transaction records are kept for a minimum of 3 years for legal and business purposes. You may request deletion of your account and personal data at any time.",
            },
            {
              title: "7. Your Rights",
              content:
                "You have the right to access, update, or delete your personal information at any time through your profile settings. You may request a complete export of your data. You can deactivate your account, which will remove your profile from public search results.",
            },
            {
              title: "8. Third-Party Services",
              content:
                "SkillSync integrates with third-party services including MongoDB for data storage, payment processors for transactions, and optionally Google for OAuth authentication. Each third-party service has its own privacy policy governing their use of your data.",
            },
            {
              title: "9. Children's Privacy",
              content:
                "SkillSync is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we discover that we have collected data from a child, we will delete it immediately.",
            },
            {
              title: "10. Changes to This Policy",
              content:
                "We may update this privacy policy periodically. We will notify users of significant changes via email and by updating the 'Last Updated' date. Continued use of SkillSync after changes constitutes acceptance of the updated policy.",
            },
          ].map((section) => (
            <AnimatedSection key={section.title} animation="fadeIn" delay={50}>
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3">{section.title}</h2>
                <p className="font-serif text-sm text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            </AnimatedSection>
          ))}

          <AnimatedSection animation="fadeIn" delay={50}>
            <div className="border-t border-border/40 pt-8 mt-12">
              <p className="font-serif text-sm text-muted-foreground italic">
                For privacy-related inquiries, contact us at{" "}
                <a href="mailto:privacy@skillsync.com" className="text-primary hover:text-primary/80">
                  privacy@skillsync.com
                </a>
              </p>
            </div>
          </AnimatedSection>
        </article>
      </main>

      <Footer />
    </div>
  )
}
