import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value || cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ user: null })
    }

    const payload = await verifyToken(token)

    if (!payload) {
      return NextResponse.json({ user: null })
    }

    // Fetch from DB to get latest fields (including username)
    await dbConnect()
    const userId = payload.userId || payload.id
    const dbUser = await User.findById(userId).select("name email role username isVerified isDeactivated")

    if (!dbUser || dbUser.isDeactivated) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        id: dbUser._id.toString(),
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        username: dbUser.username || null,
        isVerified: dbUser.isVerified ?? false,
      },
    })
  } catch {
    return NextResponse.json({ user: null })
  }
}
