import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { Notification } from "@/models/Notification";

/**
 * PUT /api/notifications/read-all — Mark all of the caller's notifications read.
 */
export async function PUT() {
  try {
    const session = await getAuthSession();

    await connectToDatabase();

    const result = await Notification.updateMany(
      { userId: session.user.id, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({ data: { marked: result.modifiedCount } });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[PUT /api/notifications/read-all]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
