import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { cookies } from "next/headers"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

// PATCH /api/users/profile — Update logged-in user's profile
export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    await dbConnect()

    const body = await req.json()
    const { name, username, bio, skills, hourlyRate, location, image } = body

    // Validate username if provided
    if (username) {
      // Only allow lowercase letters, numbers, hyphens
      const usernameRegex = /^[a-z0-9-]+$/
      if (!usernameRegex.test(username)) {
        return NextResponse.json(
          { error: "Username can only contain lowercase letters, numbers, and hyphens" },
          { status: 400 }
        )
      }
      if (username.length < 3 || username.length > 30) {
        return NextResponse.json(
          { error: "Username must be between 3 and 30 characters" },
          { status: 400 }
        )
      }

      // Check uniqueness
      const existing = await User.findOne({ username, _id: { $ne: payload.userId } })
      if (existing) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 409 })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (username !== undefined) updateData.username = username
    if (bio !== undefined) updateData.bio = bio
    if (skills !== undefined) updateData.skills = skills
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate
    if (location !== undefined) updateData.location = location
    if (image !== undefined) updateData.image = image

    const user = await User.findByIdAndUpdate(payload.userId, updateData, { new: true }).select(
      "-hashedPassword -resetToken -resetTokenExpiry"
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

// GET /api/users/profile — Get logged-in user's full profile
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findById(payload.userId).select(
      "-hashedPassword -resetToken -resetTokenExpiry"
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
