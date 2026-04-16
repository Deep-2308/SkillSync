import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

// GET /api/users/[username] — Public profile lookup
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    await dbConnect()

    const user = await User.findOne({ username: username.toLowerCase() }).select(
      "name username role image bio skills hourlyRate location portfolio rating reviewCount createdAt"
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Public profile error:", error)
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 })
  }
}
