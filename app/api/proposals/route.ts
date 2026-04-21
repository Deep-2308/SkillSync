import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import dbConnect from "@/lib/mongodb"
import Proposal from "@/models/Proposal"
import Project from "@/models/Project"
import User from "@/models/User"

// POST /api/proposals — Submit a proposal
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value || cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Invalid session" }, { status: 401 })

    await dbConnect()

    const userId = payload.userId || payload.id
    const body = await req.json()
    const { projectId, coverLetter, proposedBudget, timeline } = body

    if (!projectId || !coverLetter || !proposedBudget || !timeline) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (coverLetter.trim().length < 20) {
      return NextResponse.json({ error: "Cover letter must be at least 20 characters" }, { status: 400 })
    }

    // Verify project exists and is open
    const project = await Project.findById(projectId)
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })
    if (project.status !== "open") {
      return NextResponse.json({ error: "This project is no longer accepting proposals" }, { status: 400 })
    }

    // Prevent client from submitting proposal to own project
    if (project.clientId.toString() === userId) {
      return NextResponse.json({ error: "You cannot submit a proposal to your own project" }, { status: 400 })
    }

    // Check for duplicate
    const existing = await Proposal.findOne({ projectId, freelancerId: userId })
    if (existing) {
      return NextResponse.json({ error: "You have already submitted a proposal for this project" }, { status: 409 })
    }

    const proposal = await Proposal.create({
      projectId,
      freelancerId: userId,
      coverLetter: coverLetter.trim(),
      proposedBudget: Number(proposedBudget),
      timeline: Number(timeline),
      status: "pending",
    })

    return NextResponse.json({ proposal, message: "Proposal submitted!" }, { status: 201 })
  } catch (error) {
    console.error("Proposal submit error:", error)
    return NextResponse.json({ error: "Failed to submit proposal" }, { status: 500 })
  }
}

// GET /api/proposals?projectId=xxx or ?freelancerId=xxx
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value || cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Invalid session" }, { status: 401 })

    await dbConnect()

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")
    const freelancerId = searchParams.get("freelancerId")

    let query: Record<string, unknown> = {}
    if (projectId) query.projectId = projectId
    if (freelancerId) query.freelancerId = freelancerId

    const proposals = await Proposal.find(query)
      .populate("freelancerId", "name username image rating reviewCount skills hourlyRate location")
      .populate("projectId", "title budget status")
      .sort({ createdAt: -1 })

    return NextResponse.json({ proposals })
  } catch (error) {
    console.error("Get proposals error:", error)
    return NextResponse.json({ error: "Failed to fetch proposals" }, { status: 500 })
  }
}
