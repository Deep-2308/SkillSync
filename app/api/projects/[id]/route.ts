import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { Project } from "@/models/Project";
import { updateProjectEmbedding } from "@/lib/ai/matching";
import { Proposal } from "@/models/Proposal";

const updateProjectSchema = z.object({
  title: z.string().min(4).max(200).optional(),
  description: z.string().min(20).max(5000).optional(),
  category: z.string().min(1).optional(),
  skills: z.array(z.string()).max(5).optional(), // Updated to max 5 to match create schema
  budgetType: z.enum(["fixed", "hourly"]).optional(),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  estimatedHours: z.number().min(0).optional(),
  timeline: z.string().max(100).optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "expert"]).optional(),
  status: z.enum(["open", "in_progress", "completed", "cancelled"]).optional(),
});

/**
 * GET /api/projects/[id] — Single project detail (populate postedBy).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const project = await Project.findById(id)
      .populate("postedBy", "name image headline location role");

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ data: project.toJSON() });
  } catch (error) {
    console.error("[GET /api/projects/[id]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/**
 * PUT /api/projects/[id] — Update project (only owner).
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    if (project.postedBy.toString() !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to update this project." }, { status: 403 });
    }

    const { status: newStatus, ...coreFields } = parsed.data;

    // Restrict status transitions
    if (newStatus && newStatus !== project.status) {
      // Owning client may only directly transition from open -> cancelled
      if (project.status === "open" && newStatus === "cancelled") {
        project.status = newStatus;
      } else {
        return NextResponse.json(
          { error: "Illegal status transition. Only open -> cancelled is permitted directly." },
          { status: 400 }
        );
      }
    }

    // Do not allow editing a project's core fields once it has left the open status
    if (project.status !== "open" && Object.keys(coreFields).length > 0) {
      return NextResponse.json(
        { error: "Cannot edit project details once it is no longer open." },
        { status: 400 }
      );
    }

    // If it is open, we can update core fields
    if (project.status === "open") {
      Object.assign(project, coreFields);
    }

    await project.save();

    return NextResponse.json({ data: project.toJSON() });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[PUT /api/projects/[id]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[id] — Delete project (only owner, only if no active proposals).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    const { id } = await params;

    await connectToDatabase();

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    if (project.postedBy.toString() !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to delete this project." }, { status: 403 });
    }

    // Check for active (accepted) proposals — cannot delete if any exist.
    const activeProposals = await Proposal.countDocuments({
      projectId: id,
      status: "accepted",
    });

    if (activeProposals > 0) {
      return NextResponse.json(
        { error: "Cannot delete a project with active proposals. Cancel the contract first." },
        { status: 409 }
      );
    }

    await Project.findByIdAndDelete(id);
    // Also clean up pending proposals for this project.
    await Proposal.deleteMany({ projectId: id, status: "pending" });

    return NextResponse.json({ data: { message: "Project deleted." } });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[DELETE /api/projects/[id]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
