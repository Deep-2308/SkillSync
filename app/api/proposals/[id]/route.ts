import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { sendEmail, proposalAcceptedEmail } from "@/lib/email";
import { Proposal } from "@/models/Proposal";
import { Project } from "@/models/Project";
import { Contract } from "@/models/Contract";
import { Notification } from "@/models/Notification";

const updateProposalSchema = z.object({
  status: z.enum(["accepted", "rejected", "withdrawn"], {
    errorMap: () => ({ message: "Status must be 'accepted', 'rejected', or 'withdrawn'." }),
  }),
  clientNote: z.string().max(1000).optional().nullable(),
});

/**
 * PUT /api/proposals/[id] — Accept or reject a proposal (project owner only).
 *
 * On accept:
 *   - Wrapped in a MongoDB transaction to atomically:
 *     1. Update proposal status to "accepted"
 *     2. Create a Contract document
 *     3. Update project status to "in_progress"
 *     4. Reject all other pending proposals on the same project
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateProposalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const { status, clientNote } = parsed.data;

    await connectToDatabase();

    const proposal = await Proposal.findById(id).populate("freelancerId", "email name");
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
    }

    if (proposal.status !== "pending") {
      return NextResponse.json(
        { error: "This proposal has already been processed or withdrawn." },
        { status: 400 }
      );
    }

    // Handle Withdraw branch for freelancers
    if (status === "withdrawn") {
      if (session.user.role !== "freelancer") {
        return NextResponse.json(
          { error: "Only freelancers can withdraw proposals." },
          { status: 403 }
        );
      }
      // Check ownership
      if (proposal.freelancerId._id.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "You can only withdraw your own proposals." },
          { status: 403 }
        );
      }
      
      proposal.status = "withdrawn";
      await proposal.save();
      return NextResponse.json({ data: proposal.toJSON() });
    }

    // Verify the current user owns the project.
    const project = await Project.findById(proposal.projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    if (project.postedBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Only the project owner can accept or reject proposals." },
        { status: 403 }
      );
    }

    // Simple rejection — no transaction needed.
    if (status === "rejected") {
      proposal.status = "rejected";
      if (clientNote) {
        proposal.clientNote = clientNote;
      }
      await proposal.save();
      
      // Notify freelancer
      await Notification.create({
        userId: proposal.freelancerId._id,
        type: "proposal_update",
        title: "Proposal Rejected",
        body: `Your proposal for "${project.title}" was declined.${clientNote ? ` Reason: ${clientNote}` : ""}`,
        link: `/freelancer/proposals`,
      });

      return NextResponse.json({ data: proposal.toJSON() });
    }

    if (status === "accepted" && project.status !== "open") {
      return NextResponse.json(
        { error: "This project is no longer accepting new hires." },
        { status: 400 }
      );
    }

    // Acceptance — use a transaction for atomicity.
    const mongoSession = await mongoose.startSession();

    try {
      let contract: InstanceType<typeof Contract> | undefined;

      await mongoSession.withTransaction(async () => {
        // 1. Accept the proposal.
        proposal.status = "accepted";
        await proposal.save({ session: mongoSession });

        // 2. Create the contract.
        [contract] = await Contract.create(
          [
            {
              projectId: proposal.projectId,
              proposalId: proposal._id,
              // @ts-ignore
              clientId: project.postedBy,
              freelancerId: proposal.freelancerId._id,
              agreedRate: proposal.proposedRate,
              timeline: proposal.timeline,
              status: "active",
            },
          ],
          { session: mongoSession }
        );

        // 3. Update project status.
        project.status = "in_progress";
        await project.save({ session: mongoSession });

        // 4. Reject all other pending proposals on this project.
        const siblingsToReject = await Proposal.find(
          {
            projectId: proposal.projectId,
            _id: { $ne: proposal._id },
            status: "pending",
          },
          { freelancerId: 1 },
          { session: mongoSession }
        );

        if (siblingsToReject.length > 0) {
          await Proposal.updateMany(
            { _id: { $in: siblingsToReject.map(s => s._id) } },
            { $set: { status: "rejected" } },
            { session: mongoSession }
          );

          // Prepare notifications for auto-rejected freelancers
          const notificationsToCreate = siblingsToReject.map(sibling => ({
            userId: sibling.freelancerId,
            type: "proposal_update",
            title: "Proposal Rejected",
            body: `Your proposal for "${project.title}" was declined because the project was awarded to another freelancer.`,
            link: `/freelancer/proposals`,
          }));
          
          await Notification.insertMany(notificationsToCreate, { session: mongoSession });
        }
      });

      // Send email to freelancer
      await sendEmail({
        to: (proposal.freelancerId as any).email,
        subject: `Proposal Accepted: ${project.title}`,
        html: proposalAcceptedEmail(project.title, session.user.name || "A client"),
        category: "proposals",
      });

      // Notify freelancer in-app
      await Notification.create({
        userId: proposal.freelancerId._id,
        type: "proposal_update",
        title: "Proposal Accepted!",
        body: `Your proposal for "${project.title}" was accepted. A new contract has been created.`,
        link: `/contracts/${contract?._id.toString() || ""}`,
      });

      return NextResponse.json({
        data: {
          proposal: proposal.toJSON(),
          contract: contract ? contract.toJSON() : null,
        },
      });
    } finally {
      await mongoSession.endSession();
    }
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[PUT /api/proposals/[id]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
