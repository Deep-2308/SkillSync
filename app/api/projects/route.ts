import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/mongodb"
import Project from "@/models/Project"
import { verifyToken } from "@/lib/jwt"

export async function POST(request: Request) {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Please log in to post a project" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid session. Please log in again." }, { status: 401 })
    }

    await dbConnect()
    const body = await request.json()
    const { title, description, category, skills, budget, duration, expertiseLevel, email } = body

    if (!title || title.length < 3) {
      return NextResponse.json({ error: "Project title must be at least 3 characters" }, { status: 400 })
    }

    const project = await Project.create({
      title,
      description: description || "",
      category: category || "",
      skills: skills || [],
      budget: Number(budget) || 0,
      duration: Number(duration) || 20,
      expertiseLevel: expertiseLevel || "mid",
      clientId: payload.id,
      email: email || payload.email,
      status: "open",
    })

    return NextResponse.json(
      { project, message: "Project posted successfully!" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Post project error:", error)
    return NextResponse.json({ error: "Failed to post project" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await dbConnect()
    const projects = await Project.find({ status: "open" })
      .sort({ createdAt: -1 })
      .limit(50)

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Get projects error:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}
