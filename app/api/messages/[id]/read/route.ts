import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";

/**
 * POST /api/messages/[id]/read
 * Marks the caller's unread count for this conversation as 0.
 */
export async function POST(
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
    
    // Reset unread count for this user
    await Conversation.updateOne(
      { _id: id, "unreadCounts.userId": session.user.id },
      { $set: { "unreadCounts.$.count": 0 } }
    );

    // Optionally mark all unread messages as read (where sender is not current user)
    await Message.updateMany(
      { conversationId: id, senderId: { $ne: session.user.id }, readAt: { $exists: false } },
      { $set: { readAt: new Date() } }
    );

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[POST /api/messages/[id]/read]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
