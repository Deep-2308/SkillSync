import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/admin";
import { Contract } from "@/models/Contract";

export async function GET(request: Request) {
  try {
    await getAdminSession();
    await connectToDatabase();
    
    const disputes = await Contract.find({ status: "disputed" })
      .populate("clientId", "name email image")
      .populate("freelancerId", "name email image")
      .populate("projectId", "title")
      .sort({ updatedAt: -1 })
      .lean();
      
    return NextResponse.json({ data: disputes });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/admin/disputes]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
