import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Project from "@/models/Project"
import Proposal from "@/models/Proposal"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"

// GET /api/projects/[id] — Get single project with proposal count
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await dbConnect()

    const project = await Project.findById(id).populate("clientId", "name username image")

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const proposalCount = await Proposal.countDocuments({ projectId: id })

    // Check if current user has already submitted a proposal
    let hasProposed = false
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value || cookieStore.get("token")?.value
    if (token) {
      const payload = await verifyToken(token)
      if (payload) {
        const userId = payload.userId || payload.id
        const existing = await Proposal.findOne({ projectId: id, freelancerId: userId })
        hasProposed = !!existing
      }
    }

    return NextResponse.json({
      project,
      proposalCount,
      hasProposed,
    })
  } catch (error) {
    console.error("Get project error:", error)
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}
