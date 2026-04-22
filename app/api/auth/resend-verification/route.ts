import { NextResponse } from "next/server"
import crypto from "crypto"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { sendVerificationEmail } from "@/lib/email"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value || cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Invalid session" }, { status: 401 })

    await dbConnect()
    const userId = payload.userId || payload.id
    const user = await User.findById(userId)
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    if (user.isVerified) {
      return NextResponse.json({ message: "Email already verified" })
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    user.verificationToken = verificationToken
    user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await user.save()

    await sendVerificationEmail(user.email, verificationToken)

    return NextResponse.json({ message: "Verification email sent" })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ error: "Failed to resend" }, { status: 500 })
  }
}
