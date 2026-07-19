import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/admin";
import { Skill } from "@/models/Skill";
import { Types } from "mongoose";

export async function DELETE(
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
    
    const deleted = await Skill.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[DELETE /api/admin/content/gigs/[id]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
