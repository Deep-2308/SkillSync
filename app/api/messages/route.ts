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

    const userId = payload.userId || payload.id

    await dbConnect()

    const body = await req.json()
    const { conversationId, content } = body

    if (!conversationId || !content?.trim()) {
      return NextResponse.json({ error: "Conversation ID and message content are required" }, { status: 400 })
    }

    // Verify user is part of this conversation
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

    // Update conversation's last message
    conversation.lastMessage = content.trim().slice(0, 100)
    conversation.lastMessageAt = new Date()
    await conversation.save()

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

// GET /api/messages?conversationId=xxx — Fetch messages for a conversation
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value || cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Invalid session" }, { status: 401 })

    const userId = payload.userId || payload.id

    await dbConnect()

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 })
    }

    // Verify user is part of this conversation
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 })

    const isParticipant = conversation.participants.some(
      (p: { toString: () => string }) => p.toString() === userId
    )
    if (!isParticipant) {
      return NextResponse.json({ error: "You are not part of this conversation" }, { status: 403 })
    }

    const messages = await Message.find({ conversationId })
      .populate("senderId", "name image")
      .sort({ createdAt: 1 })
      .limit(200)

    // Mark unread messages as read
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
