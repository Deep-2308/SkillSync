import { NextResponse } from "next/server";
import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { notify } from "@/lib/notifications";
import { sendEmail, contractCompletedEmail } from "@/lib/email";
import { contractUpdateSchema } from "@/types/schemas";
import { Contract } from "@/models/Contract";
import { Project } from "@/models/Project";
import { Review } from "@/models/Review";

/**
 * GET /api/contracts/[id] — Contract detail, parties only.
 *
 * Includes `reviewStatus` so the frontend knows whether to show the
 * "leave a review" prompt after completion.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid contract id." }, { status: 400 });
    }

    await connectToDatabase();

    const contract = await Contract.findById(id)
      .populate("clientId", "name image headline")
      .populate("freelancerId", "name image headline")
      .populate("projectId", "title description");

    if (!contract) {
      return NextResponse.json({ error: "Contract not found." }, { status: 404 });
    }

    // populate() replaced the ids with docs; recover raw ids for the ACL check.
    const raw = await Contract.findById(id).select("clientId freelancerId").lean();
    const me = session.user.id;
    const isParty =
      raw?.clientId?.toString() === me || raw?.freelancerId?.toString() === me;
    if (!isParty) {
      return NextResponse.json(
        { error: "You are not a party to this contract." },
        { status: 403 }
      );
    }

    // Which parties have already reviewed (drives the review prompt).
    const reviews = await Review.find({ contractId: id }).select("reviewerId").lean();
    const reviewedBy = reviews.map((r) => r.reviewerId.toString());

    return NextResponse.json({
      data: {
        contract: contract.toJSON(),
        reviewStatus: {
          iHaveReviewed: reviewedBy.includes(me),
          otherPartyHasReviewed: reviewedBy.some((r) => r !== me),
        },
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/contracts/[id]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/**
 * PUT /api/contracts/[id] — Update contract status (parties only).
 *
 * Allowed transitions from "active": completed | disputed | cancelled.
 * Terminal states can't transition again.
 *
 * On complete:
 *   - project (if any) is marked completed
 *   - BOTH parties get a "review_prompt" notification — the platform's cue to
 *     leave a review for each other.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid contract id." }, { status: 400 });
    }

    const body = await request.json();
    const parsed = contractUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }
    const { status } = parsed.data;

    await connectToDatabase();

    const contract = await Contract.findById(id).populate("clientId", "email").populate("freelancerId", "email");
    if (!contract) {
      return NextResponse.json({ error: "Contract not found." }, { status: 404 });
    }

    const me = session.user.id;
    const client = contract.clientId._id.toString();
    const freelancer = contract.freelancerId._id.toString();
    if (me !== client && me !== freelancer) {
      return NextResponse.json(
        { error: "You are not a party to this contract." },
        { status: 403 }
      );
    }

    if (contract.status !== "active") {
      return NextResponse.json(
        { error: `A ${contract.status} contract can no longer be updated.` },
        { status: 400 }
      );
    }

    contract.status = status;
    await contract.save();

    if (status === "completed" && contract.projectId) {
      await Project.findByIdAndUpdate(contract.projectId, {
        $set: { status: "completed" },
      });
    }

    // Notify: on completion, prompt BOTH parties to review each other.
    if (status === "completed") {
      void notify([client, freelancer], {
        type: "review_prompt",
        title: "Contract completed — leave a review",
        body: "Share how it went. Reviews build trust for everyone on SkillSync.",
        link: `/contracts/${id}`,
      });

      // Send email to both parties
      await sendEmail({
        to: [contract.clientId.email, contract.freelancerId.email],
        subject: `Contract Completed`,
        html: contractCompletedEmail(contract._id.toString()),
        category: "contracts",
      });
    } else {
      const other = me === client ? freelancer : client;
      void notify([other], {
        type: "contract_update",
        title: `Contract marked as ${status}`,
        link: `/contracts/${id}`,
      });
    }

    return NextResponse.json({ data: contract.toJSON() });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[PUT /api/contracts/[id]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
