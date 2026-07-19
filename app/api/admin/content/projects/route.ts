import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/admin";
import { Project } from "@/models/Project";

export async function GET(request: Request) {
  try {
    await getAdminSession();
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20", 10));
    
    const projects = await Project.find()
      .populate("postedBy", "name email image")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
      
    return NextResponse.json({ data: projects });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/admin/content/projects]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
