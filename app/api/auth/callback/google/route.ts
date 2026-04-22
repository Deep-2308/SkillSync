import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { createToken } from "@/lib/jwt"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    if (error || !code) {
      return NextResponse.redirect(`${appUrl}/login?error=google_cancelled`)
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${appUrl}/api/auth/callback/google`

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${appUrl}/login?error=google_not_configured`)
    }

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      console.error("Google token exchange failed:", tokenData)
      return NextResponse.redirect(`${appUrl}/login?error=google_token_failed`)
    }

    // Get user profile from Google
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    const profile = await profileRes.json()

    if (!profile.email) {
      return NextResponse.redirect(`${appUrl}/login?error=google_no_email`)
    }

    await dbConnect()

    // Check if user exists (by googleId or email)
    let user = await User.findOne({
      $or: [
        { googleId: profile.id },
        { email: profile.email.toLowerCase() },
      ],
    })

    if (user) {
      // Existing user — link Google account if not already linked
      if (!user.googleId) {
        user.googleId = profile.id
        if (profile.picture && !user.image) {
          user.image = profile.picture
        }
        await user.save()
      }
    } else {
      // New user — create account
      user = await User.create({
        name: profile.name || profile.email.split("@")[0],
        email: profile.email.toLowerCase(),
        googleId: profile.id,
        image: profile.picture || "",
        role: "learner", // Default role, can change later
        isVerified: true, // Google-verified email
      })
    }

    // Create JWT session
    const token = await createToken({
      id: user._id.toString(),
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    })

    const cookieStore = await cookies()
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.redirect(`${appUrl}/hire-talent`)
  } catch (error) {
    console.error("Google OAuth callback error:", error)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    return NextResponse.redirect(`${appUrl}/login?error=google_failed`)
  }
}
