import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/admin";
import { Skill } from "@/models/Skill";

export async function GET(request: Request) {
  try {
    await getAdminSession();
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20", 10));
    
    const gigs = await Skill.find()
      .populate("providerId", "name email image")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
      
    return NextResponse.json({ data: gigs });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/admin/content/gigs]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
