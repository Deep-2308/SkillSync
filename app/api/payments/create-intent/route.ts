import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { stripe } from "@/lib/stripe";
import { Contract } from "@/models/Contract";

const createIntentSchema = z.object({
  contractId: z.string().min(1, "Contract ID is required."),
  idempotencyKey: z.string().optional(),
});

/**
 * POST /api/payments/create-intent
 *
 * Creates a Stripe PaymentIntent for a specific contract.
 * Only the designated client on the contract can create the intent.
 */
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    const body = await request.json();
    const parsed = createIntentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const { contractId, idempotencyKey } = parsed.data;

    if (!contractId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: "Invalid contract id." }, { status: 400 });
    }

    await connectToDatabase();

    const contract = await Contract.findById(contractId).populate("clientId", "email");

    if (!contract) {
      return NextResponse.json({ error: "Contract not found." }, { status: 404 });
    }

    if (contract.status !== "active") {
      return NextResponse.json(
        { error: `Cannot fund a contract that is ${contract.status}.` },
        { status: 400 }
      );
    }

    // Ensure the user is the client who must pay for the contract
    if ((contract.clientId as any)._id.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Only the client can initiate a payment for this contract." },
        { status: 403 }
      );
    }

    if (contract.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "This contract has already been paid." },
        { status: 400 }
      );
    }

    // Stripe expects the amount in the smallest currency unit (cents for USD)
    const amountInCents = Math.round(contract.agreedRate * 100);

    // Create the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amountInCents,
        currency: "usd",
        metadata: {
          contractId: contract._id.toString(),
        },
        receipt_email: (contract.clientId as any).email,
      },
      idempotencyKey ? { idempotencyKey } : undefined
    );

    return NextResponse.json({
      data: {
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[POST /api/payments/create-intent]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
