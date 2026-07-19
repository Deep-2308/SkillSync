import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/admin";
import { Contact } from "@/models/Contact";
import { Types } from "mongoose";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAdminSession();
    await connectToDatabase();
    const { id } = await params;
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }
    
    if (!contact.readAt) {
      contact.readAt = new Date();
      await contact.save();
    }
    
    return NextResponse.json({ success: true, data: contact });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[PATCH /api/admin/operations/contacts/[id]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
