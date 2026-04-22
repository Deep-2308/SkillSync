import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

// POST — Deactivate account (soft delete)
export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value || cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Invalid session" }, { status: 401 })

    await dbConnect()
    const userId = payload.userId || payload.id

    await User.findByIdAndUpdate(userId, {
      isDeactivated: true,
      deactivatedAt: new Date(),
    })

    // Clear session
    cookieStore.delete("token")
    cookieStore.delete("session")

    return NextResponse.json({ message: "Account deactivated successfully" })
  } catch (error) {
    console.error("Deactivate error:", error)
    return NextResponse.json({ error: "Failed to deactivate account" }, { status: 500 })
  }
}

// DELETE — Permanently delete account
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value || cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Invalid session" }, { status: 401 })

    await dbConnect()
    const userId = payload.userId || payload.id

    await User.findByIdAndDelete(userId)

    // Clear session
    cookieStore.delete("token")
    cookieStore.delete("session")

    return NextResponse.json({ message: "Account permanently deleted" })
  } catch (error) {
    console.error("Delete account error:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
