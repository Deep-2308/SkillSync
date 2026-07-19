import { Resend } from "resend";

// Resend instance will fail gracefully if no API key is provided
const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");
const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@skillsync.com";

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  category?: "proposals" | "contracts" | "payments" | "reviews" | "messages" | "system";
}

/**
 * Sends a transactional email using Resend.
 * Wrapped in try/catch to ensure it never throws and breaks a main API flow.
 */
export async function sendEmail({ to, subject, html, category }: EmailPayload): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY missing. Skipping email send:", { to, subject });
    return;
  }

  // 1. Fetch user to check notification preferences if category is provided
  if (category && category !== "system") {
    try {
      const { User } = await import("@/models/User");
      const { connectToDatabase } = await import("@/lib/mongodb");
      
      await connectToDatabase();
      
      // If `to` is an array, we'd need to check all of them, but in our app it's always a string.
      const emailToCheck = Array.isArray(to) ? to[0] : to;
      const user = await User.findOne({ email: emailToCheck });

      const prefs = user?.notificationPreferences as Record<string, boolean> | undefined;
      if (prefs && prefs[category] === false) {
        console.log(`[Email] Suppressed ${category} email to ${to} due to user preferences.`);
        return;
      }
    } catch (err) {
      console.error("[Email] Error checking user preferences:", err);
      // Fail open: send the email if DB check fails
    }
  }

  try {
    const response = await resend.emails.send({
      from: `SkillSync <${fromEmail}>`,
      to,
      subject,
      html,
    });

    if (response.error) {
      console.error("[Email] Resend API error:", response.error);
    } else {
      console.log(`[Email] Sent successfully to ${to} (${response.data?.id})`);
    }
  } catch (error) {
    console.error("[Email] Unexpected error sending email:", error);
  }
}

/* --- HTML TEMPLATES --- */

const baseStyles = `font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 20px; color: #18181b;`;
const buttonStyles = `display: inline-block; background: #1D4ED8; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;`;

export function welcomeEmail(name: string): string {
  return `
    <div style="${baseStyles}">
      <h2 style="color: #1D4ED8; margin-bottom: 8px;">Welcome to SkillSync!</h2>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
      <p style="font-size: 16px; line-height: 1.6;">Hi ${name},</p>
      <p style="font-size: 16px; line-height: 1.6;">
        We're thrilled to have you join our community. Whether you're here to hire top talent or offer your services as a freelancer, SkillSync is the place to make it happen.
      </p>
      <p style="font-size: 16px; line-height: 1.6;">
        Get started by exploring projects or updating your profile!
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="${buttonStyles}">Go to Dashboard</a>
    </div>
  `;
}

export function proposalReceivedEmail(projectTitle: string, proposerName: string): string {
  return `
    <div style="${baseStyles}">
      <h2 style="color: #1D4ED8; margin-bottom: 8px;">New Proposal Received</h2>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
      <p style="font-size: 16px; line-height: 1.6;">
        Great news! <strong>${proposerName}</strong> just submitted a proposal for your project: <em>${projectTitle}</em>.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="${buttonStyles}">Review Proposal</a>
    </div>
  `;
}

export function proposalAcceptedEmail(projectTitle: string, clientName: string): string {
  return `
    <div style="${baseStyles}">
      <h2 style="color: #16a34a; margin-bottom: 8px;">Proposal Accepted!</h2>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
      <p style="font-size: 16px; line-height: 1.6;">
        Congratulations! <strong>${clientName}</strong> has accepted your proposal for the project: <em>${projectTitle}</em>.
      </p>
      <p style="font-size: 16px; line-height: 1.6;">
        A contract has been generated. Head over to your dashboard to view the details and start collaborating.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="${buttonStyles}">View Contract</a>
    </div>
  `;
}

export function contractCompletedEmail(contractId: string): string {
  return `
    <div style="${baseStyles}">
      <h2 style="color: #1D4ED8; margin-bottom: 8px;">Contract Completed</h2>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
      <p style="font-size: 16px; line-height: 1.6;">
        Your contract (ID: ${contractId}) has been marked as <strong>Completed</strong>.
      </p>
      <p style="font-size: 16px; line-height: 1.6;">
        Please take a moment to leave a review for the other party. Reviews help build trust in the SkillSync community!
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="${buttonStyles}">Leave a Review</a>
    </div>
  `;
}

export function passwordResetEmail(resetUrl: string, name: string): string {
  return `
    <div style="${baseStyles}">
      <h2 style="color: #1D4ED8; margin-bottom: 8px;">SkillSync</h2>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
      <h3 style="color: #18181b;">Password Reset Request</h3>
      <p style="color: #52525b; line-height: 1.6;">
        Hi ${name},<br><br>
        We received a request to reset your password. Click the button below to create a new password. This link expires in <strong>1 hour</strong>.
      </p>
      <a href="${resetUrl}" style="${buttonStyles}">
        Reset Password
      </a>
      <p style="color: #71717a; font-size: 14px; line-height: 1.6;">
        If you didn't request this, you can safely ignore this email. Your password won't change.
      </p>
    </div>
  `;
}

export function contractFundedEmail(projectTitle: string, amount: number): string {
  return `
    <div style="${baseStyles}">
      <h2 style="color: #16a34a; margin-bottom: 8px;">Contract Funded</h2>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
      <p style="font-size: 16px; line-height: 1.6;">
        Great news! The contract for <em>${projectTitle}</em> has been funded with <strong>$${amount}</strong>.
      </p>
      <p style="font-size: 16px; line-height: 1.6;">
        The funds are now secure, and work can officially begin.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="${buttonStyles}">View Contract</a>
    </div>
  `;
}

export function workDeliveredEmail(projectTitle: string, freelancerName: string): string {
  return `
    <div style="${baseStyles}">
      <h2 style="color: #1D4ED8; margin-bottom: 8px;">Work Delivered</h2>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
      <p style="font-size: 16px; line-height: 1.6;">
        <strong>${freelancerName}</strong> has marked the work for <em>${projectTitle}</em> as delivered.
      </p>
      <p style="font-size: 16px; line-height: 1.6;">
        Please review the deliverables and complete the contract to release the funds.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="${buttonStyles}">Review Work</a>
    </div>
  `;
}

export function paymentFailedEmail(projectTitle: string, errorMessage: string): string {
  return `
    <div style="${baseStyles}">
      <h2 style="color: #dc2626; margin-bottom: 8px;">Payment Failed</h2>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
      <p style="font-size: 16px; line-height: 1.6;">
        Unfortunately, a payment attempt for the project <em>${projectTitle}</em> has failed.
      </p>
      <p style="font-size: 16px; line-height: 1.6;">
        <strong>Reason:</strong> ${errorMessage}
      </p>
      <p style="font-size: 16px; line-height: 1.6;">
        Please update your payment method to ensure the contract can proceed.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="${buttonStyles}">Go to Dashboard</a>
    </div>
  `;
}

export function reviewReceivedEmail(reviewerName: string): string {
  return `
    <div style="${baseStyles}">
      <h2 style="color: #1D4ED8; margin-bottom: 8px;">New Review Received</h2>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
      <p style="font-size: 16px; line-height: 1.6;">
        <strong>${reviewerName}</strong> just left you a review!
      </p>
      <p style="font-size: 16px; line-height: 1.6;">
        Check out your profile to see what they said and how it affects your overall rating.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="${buttonStyles}">View Review</a>
    </div>
  `;
}

export function messageReceivedEmail(senderName: string): string {
  return `
    <div style="${baseStyles}">
      <h2 style="color: #1D4ED8; margin-bottom: 8px;">New Message</h2>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
      <p style="font-size: 16px; line-height: 1.6;">
        You have received a new message from <strong>${senderName}</strong>.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="${buttonStyles}">Reply to Message</a>
    </div>
  `;
}

export function verificationEmail(verifyUrl: string, name: string): string {
  return `
    <div style="${baseStyles}">
      <h2 style="color: #1D4ED8; margin-bottom: 8px;">Verify Your Email</h2>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
      <h3 style="color: #18181b;">Welcome to SkillSync, ${name}!</h3>
      <p style="color: #52525b; line-height: 1.6;">
        Please verify your email address to get full access to the platform. Click the button below to complete your registration.
      </p>
      <a href="${verifyUrl}" style="${buttonStyles}">
        Verify Email
      </a>
      <p style="color: #71717a; font-size: 14px; line-height: 1.6;">
        This link expires in <strong>24 hours</strong>. If you did not create an account, you can safely ignore this email.
      </p>
    </div>
  `;
}
