import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import dbConnect from "@/lib/mongodb"
import Message from "@/models/Message"
import Conversation from "@/models/Conversation"

// POST /api/messages — Send a message
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value || cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Invalid session" }, { status: 401 })

    await dbConnect()
    const userId = payload.userId || payload.id

    const body = await req.json()
    const { conversationId, content } = body

    if (!conversationId || !content?.trim()) {
      return NextResponse.json({ error: "Conversation ID and message content are required" }, { status: 400 })
    }

    // Verify user is a participant
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 })

    const isParticipant = conversation.participants.some(
      (p: { toString: () => string }) => p.toString() === userId
    )
    if (!isParticipant) {
      return NextResponse.json({ error: "You are not part of this conversation" }, { status: 403 })
    }

    const message = await Message.create({
      conversationId,
      senderId: userId,
      content: content.trim(),
    })

    // Update conversation preview
    conversation.lastMessage = content.trim().slice(0, 100)
    conversation.lastMessageAt = new Date()
    await conversation.save()

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

// GET /api/messages?conversationId=xxx&after=timestamp
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value || cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Invalid session" }, { status: 401 })

    await dbConnect()
    const userId = payload.userId || payload.id

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get("conversationId")
    const after = searchParams.get("after")

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 })
    }

    // Verify participant
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 })

    const isParticipant = conversation.participants.some(
      (p: { toString: () => string }) => p.toString() === userId
    )
    if (!isParticipant) {
      return NextResponse.json({ error: "You are not part of this conversation" }, { status: 403 })
    }

    const query: Record<string, unknown> = { conversationId }
    if (after) {
      query.createdAt = { $gt: new Date(after) }
    }

    const messages = await Message.find(query)
      .populate("senderId", "name image")
      .sort({ createdAt: 1 })
      .limit(100)

    // Mark messages as read
    await Message.updateMany(
      { conversationId, senderId: { $ne: userId }, read: false },
      { read: true }
    )

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
