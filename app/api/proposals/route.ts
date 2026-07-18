import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
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

    // Verify project exists and is open.
    const project = await Project.findById(projectId);
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
    if (project.postedBy.toString() === session.user.id) {
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

    return NextResponse.json({ data: proposal.toJSON() }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[POST /api/proposals]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
