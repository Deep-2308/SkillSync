import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

// GET /api/auth/verify-email?token=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    if (!token) {
      return NextResponse.redirect(`${appUrl}/verify-email?status=invalid`)
    }

    await dbConnect()

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.redirect(`${appUrl}/verify-email?status=expired`)
    }

    user.isVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpiry = undefined
    await user.save()

    return NextResponse.redirect(`${appUrl}/verify-email?status=success`)
  } catch (error) {
    console.error("Email verification error:", error)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    return NextResponse.redirect(`${appUrl}/verify-email?status=error`)
  }
}
