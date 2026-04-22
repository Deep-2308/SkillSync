import { NextResponse } from "next/server"
import crypto from "crypto"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { sendPasswordResetEmail } from "@/lib/email"

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

    // Check if user signed up with Google (no password to reset)
    if (user.googleId && !user.hashedPassword) {
      return NextResponse.json({
        message: "If an account with that email exists, a reset link has been sent.",
        // Don't reveal that they used Google login
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    user.resetToken = resetToken
    user.resetTokenExpiry = resetTokenExpiry
    await user.save()

    // Send the reset email
    const emailResult = await sendPasswordResetEmail(email, resetToken)

    return NextResponse.json({
      message: "If an account with that email exists, a reset link has been sent.",
      // DEV ONLY — show token when no email service configured:
      ...(emailResult.dev && { devToken: resetToken }),
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
