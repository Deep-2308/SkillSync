import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { signToken } from "@/lib/jwt"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    await dbConnect()
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email. Please sign up first." },
        { status: 401 }
      )
    }

    // Check if account is deactivated
    if (user.isDeactivated) {
      return NextResponse.json(
        { error: "This account has been deactivated. Contact support to reactivate." },
        { status: 403 }
      )
    }

    // Check if this is a Google-only account (no password set)
    if (!user.hashedPassword) {
      return NextResponse.json(
        { error: "This account uses Google sign-in. Please use the 'Continue with Google' button." },
        { status: 400 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.hashedPassword)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = await signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    })

    // Set HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Failed to log in. Please try again." },
      { status: 500 }
    )
  }
}
