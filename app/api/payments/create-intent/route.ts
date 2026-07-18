import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { stripe } from "@/lib/stripe";
import { Contract } from "@/models/Contract";

const createIntentSchema = z.object({
  contractId: z.string().min(1, "Contract ID is required."),
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

    const { contractId } = parsed.data;

    await connectToDatabase();

    const contract = await Contract.findById(contractId);

    if (!contract) {
      return NextResponse.json({ error: "Contract not found." }, { status: 404 });
    }

    // Ensure the user is the client who must pay for the contract
    if (contract.clientId.toString() !== session.user.id) {
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
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        contractId: contract._id.toString(),
      },
      // You can also pass customer email or other fields for receipts
    });

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
