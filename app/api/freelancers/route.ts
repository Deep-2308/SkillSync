import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function GET(request: Request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const skill = searchParams.get("skill") || ""

    // Build query for expert users
    const query: Record<string, unknown> = { role: "expert" }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ]
    }

    if (skill) {
      query.skills = { $regex: skill, $options: "i" }
    }

    const freelancers = await User.find(query)
      .select("name role skills rating reviewCount location image bio hourlyRate")
      .sort({ rating: -1, reviewCount: -1 })
      .limit(50)

    return NextResponse.json({ freelancers })
  } catch (error) {
    console.error("Get freelancers error:", error)
    return NextResponse.json({ error: "Failed to fetch freelancers" }, { status: 500 })
  }
}
