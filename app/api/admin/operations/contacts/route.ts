import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/admin";
import { Contact } from "@/models/Contact";

export async function GET(request: Request) {
  try {
    await getAdminSession();
    await connectToDatabase();
    
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .lean();
      
    return NextResponse.json({ data: contacts });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/admin/operations/contacts]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
