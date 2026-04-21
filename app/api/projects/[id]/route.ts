import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Project from "@/models/Project"
import Proposal from "@/models/Proposal"

// GET /api/projects/[id] — Get single project with client info
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await dbConnect()

    const project = await Project.findById(id)
      .populate("clientId", "name username image")

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Get proposal count
    const proposalCount = await Proposal.countDocuments({ projectId: id })

    return NextResponse.json({ project, proposalCount })
  } catch (error) {
    console.error("Get project error:", error)
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}
