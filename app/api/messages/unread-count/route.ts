import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { Conversation } from "@/models/Conversation";

/**
 * GET /api/messages/unread-count
 * Returns the total unread message count for the caller.
 */
export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    await connectToDatabase();
    
    const conversations = await Conversation.find({ participants: session.user.id }).lean();
    
    let totalUnread = 0;
    for (const conv of conversations) {
      const entry = conv.unreadCounts.find((c: any) => c.userId.toString() === session.user.id);
      if (entry) {
        totalUnread += entry.count;
      }
    }

    return NextResponse.json({ data: { unreadCount: totalUnread } }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/messages/unread-count]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
