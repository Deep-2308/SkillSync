import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { sendEmail, proposalReceivedEmail } from "@/lib/email";
import { Proposal } from "@/models/Proposal";
import { Project } from "@/models/Project";

const createProposalSchema = z.object({
  projectId: z.string().min(1, "Project ID is required."),
  message: z.string().min(10, "Message must be at least 10 characters.").max(3000),
  proposedRate: z.number().min(0, "Rate cannot be negative."),
  timeline: z.string().min(1, "Timeline is required.").max(200),
});

/**
 * POST /api/proposals — Submit a proposal on a project.
 */
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    
    if (session.user.role !== "freelancer") {
      return NextResponse.json(
        { error: "Only freelancers can submit proposals." },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const parsed = createProposalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const { projectId, message, proposedRate, timeline } = parsed.data;

    await connectToDatabase();

    // Verify project exists and is open. We populate postedBy to get the client's email for the notification.
    // @ts-ignore
    const project = await Project.findById(projectId).populate("postedBy", "email name");
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    if (project.status !== "open") {
      return NextResponse.json(
        { error: "This project is no longer accepting proposals." },
        { status: 400 }
      );
    }

    // Cannot propose on own project.
    if (project.postedBy._id.toString() === session.user.id) {
      return NextResponse.json(
        { error: "You cannot submit a proposal on your own project." },
        { status: 400 }
      );
    }

    // Check for duplicate proposal (compound unique index also guards this).
    const existing = await Proposal.findOne({
      projectId,
      freelancerId: session.user.id,
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted a proposal for this project." },
        { status: 409 }
      );
    }

    const proposal = await Proposal.create({
      projectId,
      freelancerId: session.user.id,
      message,
      proposedRate,
      timeline,
      status: "pending",
    });

    // Send email notification to project owner
    await sendEmail({
      to: project.postedBy.email,
      subject: `New Proposal: ${project.title}`,
      html: proposalReceivedEmail(project.title, session.user.name || "A freelancer"),
      category: "proposals",
    });

    // In-app notification
    const { Notification } = await import("@/models/Notification");
    await Notification.create({
      userId: project.postedBy._id,
      type: "proposal_received",
      title: `New Proposal from ${session.user.name || "A freelancer"}`,
      body: `You received a new proposal for "${project.title}".`,
      link: `/projects/${projectId}/proposals`,
    });

    return NextResponse.json({ data: proposal.toJSON() }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[POST /api/proposals]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
