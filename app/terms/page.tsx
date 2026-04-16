import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AnimatedSection } from "@/components/animated-section"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-3xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="slideUp" delay={0}>
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-4 block">Legal</span>
          <h1 className="font-display text-4xl font-bold text-foreground mb-8 tracking-tight">Terms of Service</h1>
          <p className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground mb-12">
            Last updated: April 2026
          </p>
        </AnimatedSection>

        <article className="prose-custom space-y-8">
          {[
            {
              title: "1. Acceptance of Terms",
              content:
                "By accessing and using SkillSync, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our platform.",
            },
            {
              title: "2. Description of Service",
              content:
                "SkillSync is a freelance marketplace that connects clients with freelancers through AI-powered matching. We provide a platform for posting projects, submitting proposals, managing contracts, processing payments, and facilitating reviews.",
            },
            {
              title: "3. User Accounts",
              content:
                "You must register for an account to use certain features of SkillSync. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating your account.",
            },
            {
              title: "4. User Conduct",
              content:
                "You agree not to use SkillSync for any unlawful purpose or in any way that could damage, disable, or impair the platform. You must not attempt to gain unauthorized access to any part of the service, other accounts, or computer systems. All content you post must be accurate and not misleading.",
            },
            {
              title: "5. Payments & Fees",
              content:
                "SkillSync charges a platform fee on completed transactions. All payments are processed through our secure escrow system. Funds are held until milestones are approved by the client. Freelancers can withdraw earnings to their linked payment method, subject to a minimum threshold and processing time.",
            },
            {
              title: "6. Intellectual Property",
              content:
                "Upon full payment, intellectual property rights for work completed through SkillSync transfer to the client unless otherwise agreed upon in the project contract. SkillSync retains rights to its platform, branding, and proprietary technology.",
            },
            {
              title: "7. Dispute Resolution",
              content:
                "In the event of a dispute between a client and freelancer, SkillSync provides a mediation process. Both parties agree to participate in good faith. SkillSync's decision in disputes regarding escrowed funds is final and binding.",
            },
            {
              title: "8. Limitation of Liability",
              content:
                "SkillSync provides the platform 'as is' without warranties of any kind. We are not liable for the quality of work, actions of users, or any indirect, incidental, or consequential damages arising from the use of our platform.",
            },
            {
              title: "9. Termination",
              content:
                "SkillSync reserves the right to suspend or terminate any account that violates these terms. You may deactivate your account at any time. Upon termination, any pending payments will be processed according to existing agreements.",
            },
            {
              title: "10. Changes to Terms",
              content:
                "We may update these terms from time to time. We will notify registered users of significant changes via email. Continued use of the platform after changes constitutes acceptance of the updated terms.",
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
                If you have any questions about these terms, please contact us at{" "}
                <a href="mailto:legal@skillsync.com" className="text-primary hover:text-primary/80">
                  legal@skillsync.com
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
