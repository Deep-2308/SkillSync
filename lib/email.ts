import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
const FROM_EMAIL = process.env.FROM_EMAIL || "SkillSync <onboarding@resend.dev>"

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const resetLink = `${APP_URL}/reset-password?token=${resetToken}`

  if (!resend) {
    console.log(`[DEV] Password reset link for ${to}: ${resetLink}`)
    return { success: true, dev: true }
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Reset Your SkillSync Password",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e5e5e5; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #b8860b 0%, #daa520 100%); padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: #0a0a0a; letter-spacing: -0.5px;">SkillSync</h1>
          </div>
          <div style="padding: 40px 32px;">
            <h2 style="margin: 0 0 16px; font-size: 20px; color: #ffffff;">Password Reset Request</h2>
            <p style="margin: 0 0 24px; color: #a1a1aa; font-size: 14px; line-height: 1.6;">
              We received a request to reset your password. Click the button below to choose a new one. This link expires in <strong style="color: #daa520;">1 hour</strong>.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #b8860b 0%, #daa520 100%); color: #0a0a0a; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">
                Reset Password
              </a>
            </div>
            <p style="margin: 24px 0 0; color: #71717a; font-size: 12px; line-height: 1.5;">
              If you didn't request this, you can safely ignore this email. Your password won't change.
            </p>
            <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;" />
            <p style="margin: 0; color: #52525b; font-size: 11px; font-family: monospace;">
              Can't click the button? Copy this link:<br/>
              <a href="${resetLink}" style="color: #daa520; word-break: break-all;">${resetLink}</a>
            </p>
          </div>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error }
  }
}

export async function sendVerificationEmail(to: string, verificationToken: string) {
  const verifyLink = `${APP_URL}/api/auth/verify-email?token=${verificationToken}`

  if (!resend) {
    console.log(`[DEV] Verification link for ${to}: ${verifyLink}`)
    return { success: true, dev: true }
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Verify Your SkillSync Email",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e5e5e5; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #b8860b 0%, #daa520 100%); padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: #0a0a0a; letter-spacing: -0.5px;">SkillSync</h1>
          </div>
          <div style="padding: 40px 32px;">
            <h2 style="margin: 0 0 16px; font-size: 20px; color: #ffffff;">Welcome to SkillSync! 🎉</h2>
            <p style="margin: 0 0 24px; color: #a1a1aa; font-size: 14px; line-height: 1.6;">
              You're almost there! Verify your email address to unlock all platform features.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verifyLink}" style="display: inline-block; background: linear-gradient(135deg, #b8860b 0%, #daa520 100%); color: #0a0a0a; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">
                Verify Email
              </a>
            </div>
            <p style="margin: 24px 0 0; color: #71717a; font-size: 12px; line-height: 1.5;">
              This link expires in 24 hours. If you didn't create an account, ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;" />
            <p style="margin: 0; color: #52525b; font-size: 11px; font-family: monospace;">
              Can't click the button? Copy this link:<br/>
              <a href="${verifyLink}" style="color: #daa520; word-break: break-all;">${verifyLink}</a>
            </p>
          </div>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error }
  }
}
