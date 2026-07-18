import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession, parsePagination } from "@/lib/api-utils";
import { Notification } from "@/models/Notification";

/**
 * GET /api/notifications — The caller's notifications, newest first.
 * ?page=1&limit=12
 *
 * The unread count rides on the X-Unread-Count response header (per spec) as
 * well as in the body, so clients can update a badge without parsing JSON.
 */
export async function GET(request: Request) {
  try {
    const session = await getAuthSession();

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const [notifications, total, unread] = await Promise.all([
      Notification.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ userId: session.user.id }),
      Notification.countDocuments({ userId: session.user.id, read: false }),
    ]);

    return NextResponse.json(
      {
        data: {
          notifications: notifications.map((n) => n.toJSON()),
          total,
          unread,
          page,
          pages: Math.ceil(total / limit),
        },
      },
      { headers: { "X-Unread-Count": String(unread) } }
    );
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/notifications]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
