import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/admin";
import { isValidObjectId } from "@/lib/api-utils";
import { Project } from "@/models/Project";
import { Types } from "mongoose";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAdminSession();
    await connectToDatabase();
    const { id } = await params;
    const badId = isValidObjectId(id);
    if (badId) return badId;
    
    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[DELETE /api/admin/content/projects/[id]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
