import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import mongoose from "mongoose";

/**
 * GET /api/messages
 * Lists the caller's conversations sorted by lastMessageAt descending.
 */
export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    await connectToDatabase();
    
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "name image headline")
      .populate("projectId", "title")
      .populate("contractId")
      .sort({ lastMessageAt: -1 })
      .lean();

    // Attach latest message for preview
    const populated = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({ conversationId: conv._id })
          .sort({ createdAt: -1 })
          .lean();

        return {
          ...conv,
          lastMessage,
        };
      })
    );

    return NextResponse.json({ data: populated });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/messages]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
