import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import dbConnect from "@/lib/mongodb"
import Conversation from "@/models/Conversation"

// GET /api/conversations — List all conversations for logged-in user
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value || cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Invalid session" }, { status: 401 })

    await dbConnect()
    const userId = payload.userId || payload.id

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name username image")
      .populate("projectId", "title")
      .sort({ lastMessageAt: -1 })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Get conversations error:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}
