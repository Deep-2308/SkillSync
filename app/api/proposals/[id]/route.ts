import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import dbConnect from "@/lib/mongodb"
import Proposal from "@/models/Proposal"
import Project from "@/models/Project"
import Conversation from "@/models/Conversation"

// PATCH /api/proposals/[id] — Accept or reject a proposal
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value || cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Invalid session" }, { status: 401 })

    const { id } = await params
    const userId = payload.userId || payload.id

    await dbConnect()

    const body = await req.json()
    const { status } = body

    if (!["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Status must be 'accepted' or 'rejected'" }, { status: 400 })
    }

    const proposal = await Proposal.findById(id)
    if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 })

    // Verify the logged-in user is the project owner
    const project = await Project.findById(proposal.projectId)
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })
    if (project.clientId.toString() !== userId) {
      return NextResponse.json({ error: "Only the project owner can manage proposals" }, { status: 403 })
    }

    // Update proposal status
    proposal.status = status
    await proposal.save()

    // If accepted: update project, reject other proposals, create conversation
    if (status === "accepted") {
      // Update project status and assign freelancer
      project.status = "in-progress"
      project.freelancerId = proposal.freelancerId
      await project.save()

      // Reject all other pending proposals for this project
      await Proposal.updateMany(
        { projectId: project._id, _id: { $ne: proposal._id }, status: "pending" },
        { status: "rejected" }
      )

      // Create a conversation between client and freelancer
      const existingConvo = await Conversation.findOne({
        participants: { $all: [project.clientId, proposal.freelancerId] },
        projectId: project._id,
      })

      if (!existingConvo) {
        await Conversation.create({
          participants: [project.clientId, proposal.freelancerId],
          projectId: project._id,
          lastMessage: "Proposal accepted! Start chatting.",
          lastMessageAt: new Date(),
        })
      }
    }

    return NextResponse.json({ proposal, message: `Proposal ${status}` })
  } catch (error) {
    console.error("Proposal update error:", error)
    return NextResponse.json({ error: "Failed to update proposal" }, { status: 500 })
  }
}
