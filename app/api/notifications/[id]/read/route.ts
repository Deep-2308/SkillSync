import { NextResponse } from "next/server";
import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession, isValidObjectId } from "@/lib/api-utils";
import { Notification } from "@/models/Notification";

/**
 * PUT /api/notifications/[id]/read — Mark one notification as read.
 * The userId in the filter makes it impossible to mark someone else's.
 */
export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    const { id } = await params;
    const badId = isValidObjectId(id);
    if (badId) return badId;

    await connectToDatabase();

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ error: "Notification not found." }, { status: 404 });
    }

    return NextResponse.json({ data: notification.toJSON() });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[PUT /api/notifications/[id]/read]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
