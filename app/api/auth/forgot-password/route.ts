import { NextResponse } from "next/server"
import crypto from "crypto"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request: Request) {
  try {
    await dbConnect()
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email: email.toLowerCase() })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account with that email exists, a reset link has been sent.",
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    user.resetToken = resetToken
    user.resetTokenExpiry = resetTokenExpiry
    await user.save()

    // In production, send email with reset link:
    // https://yoursite.com/reset-password?token=${resetToken}
    // For development, log the token:
    console.log(`[DEV] Password reset token for ${email}: ${resetToken}`)
    console.log(`[DEV] Reset link: http://localhost:3000/reset-password?token=${resetToken}`)

    return NextResponse.json({
      message: "If an account with that email exists, a reset link has been sent.",
      // DEV ONLY — remove in production:
      ...(process.env.NODE_ENV !== "production" && { devToken: resetToken }),
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
