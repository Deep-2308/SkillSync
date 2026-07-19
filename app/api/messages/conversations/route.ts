import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { Conversation } from "@/models/Conversation";
import { User } from "@/models/User";
import { z } from "zod";
import mongoose from "mongoose";

const createConversationSchema = z.object({
  participantId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid participant ID"),
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid project ID").optional(),
  contractId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid contract ID").optional(),
});

/**
 * POST /api/messages/conversations
 * Gets or creates a conversation between the caller and the participant.
 */
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    const body = await request.json();
    const parsed = createConversationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const { participantId, projectId, contractId } = parsed.data;

    if (participantId === session.user.id) {
      return NextResponse.json({ error: "Cannot start a conversation with yourself." }, { status: 400 });
    }

    await connectToDatabase();

    const otherUser = await User.findById(participantId);
    if (!otherUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Sort participants to ensure consistent ordering for unique index
    const sortedParticipants = [session.user.id, participantId].sort().map(id => new mongoose.Types.ObjectId(id));

    // Construct match query
    const matchQuery: any = {
      participants: sortedParticipants,
    };
    if (projectId) matchQuery.projectId = new mongoose.Types.ObjectId(projectId);
    if (contractId) matchQuery.contractId = new mongoose.Types.ObjectId(contractId);

    // Initial unreadCounts array
    const unreadCounts = [
      { userId: new mongoose.Types.ObjectId(session.user.id), count: 0 },
      { userId: new mongoose.Types.ObjectId(participantId), count: 0 }
    ];

    // Find or create atomically
    const conversation = await Conversation.findOneAndUpdate(
      matchQuery,
      {
        $setOnInsert: {
          participants: sortedParticipants,
          projectId: projectId ? new mongoose.Types.ObjectId(projectId) : undefined,
          contractId: contractId ? new mongoose.Types.ObjectId(contractId) : undefined,
          unreadCounts,
          lastMessageAt: new Date(),
        }
      },
      {
        new: true,
        upsert: true,
      }
    );

    return NextResponse.json({ data: { conversationId: conversation._id } });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[POST /api/messages/conversations]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
