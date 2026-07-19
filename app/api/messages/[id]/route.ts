import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import { notify } from "@/lib/notifications";
import { sendEmail } from "@/lib/email";
import mongoose from "mongoose";
import { z } from "zod";
import { User } from "@/models/User";

const sendMessageSchema = z.object({
  body: z.string().min(1, "Message cannot be empty").max(4000, "Message is too long"),
  attachmentUrl: z.string().url().optional().or(z.literal("")),
});

/**
 * GET /api/messages/[id]
 * Lists messages in a conversation.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    const { id } = await params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
    }

    await connectToDatabase();
    
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Verify caller is a participant
    if (!conversation.participants.some(p => p.toString() === session.user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Optional: pagination can be implemented via query params (limit, before)
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const before = url.searchParams.get("before");

    const query: any = { conversationId: conversation._id };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("senderId", "name image")
      .lean();

    // Return in chronological order for UI
    return NextResponse.json({ data: messages.reverse() });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/messages/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/messages/[id]
 * Sends a message in a conversation.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    const { id } = await params;
    const bodyText = await request.json();
    const parsed = sendMessageSchema.safeParse(bodyText);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
    }

    await connectToDatabase();

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (!conversation.participants.some(p => p.toString() === session.user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const recipientId = conversation.participants.find(p => p.toString() !== session.user.id);
    
    // Create the message
    const message = await Message.create({
      conversationId: conversation._id,
      senderId: new mongoose.Types.ObjectId(session.user.id),
      body: parsed.data.body,
      attachmentUrl: parsed.data.attachmentUrl || undefined,
    });

    // Update conversation lastMessageAt and unreadCounts
    await Conversation.updateOne(
      { _id: conversation._id, "unreadCounts.userId": recipientId },
      { 
        $set: { lastMessageAt: new Date() },
        $inc: { "unreadCounts.$.count": 1 } 
      }
    );

    // Fetch sender to include name in notification
    const sender = await User.findById(session.user.id).select("name");

    // Dispatch notification to recipient
    if (recipientId) {
      await notify([recipientId.toString()], {
        type: "new_message",
        title: "New Message",
        body: `You received a new message from ${sender?.name}.`,
        link: `/messages?id=${conversation._id}`,
      });
      
      // Attempt to send email Notification
      const recipient = await User.findById(recipientId).select("email notificationPreferences");
      if (recipient && (recipient.notificationPreferences as any)?.messages !== false) {
        await sendEmail({
          to: recipient.email,
          subject: `New message from ${sender?.name}`,
          html: `<p>You have received a new message on SkillSync from ${sender?.name}:</p><blockquote style="border-left: 3px solid #ccc; padding-left: 10px; color: #555;">${parsed.data.body}</blockquote><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/messages?id=${conversation._id}">Reply to Message</a>`,
          category: "messages"
        });
      }
    }

    return NextResponse.json({ data: message }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[POST /api/messages/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
