import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectToDatabase } from "@/lib/mongodb";
import { Contract } from "@/models/Contract";
import { Transaction } from "@/models/Transaction";
import { notify } from "@/lib/notifications";
import { sendEmail, contractFundedEmail, paymentFailedEmail } from "@/lib/email";

// Removed Pages-Router config
/**
 * POST /api/payments/webhook
 *
 * Stripe webhook endpoint.
 * Stripe sends events here asynchronously when payments succeed, fail, etc.
 */
export async function POST(request: Request) {
  // Read the raw body as a string for webhook verification
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error("[Webhook] Missing signature or webhook secret.");
    return new Response("Webhook Error: Missing signature or secret.", { status: 400 });
  }

  let event;

  try {
    // 1. Verify the signature to guarantee the event came from Stripe
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[Webhook] Signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    await connectToDatabase();

    // 2. Handle the specific event types we care about
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Record<string, any>;
        const contractId = paymentIntent.metadata?.contractId;

        if (contractId) {
          console.log(`[Webhook] Payment succeeded for contract ${contractId}`);

          const existingTx = await Transaction.findOne({
            stripePaymentIntentId: paymentIntent.id,
            type: "funding",
          });

          if (!existingTx) {
            const contract = await Contract.findByIdAndUpdate(
              contractId,
              { paymentStatus: "paid" },
              { new: true }
            ).populate("clientId", "email name").populate("freelancerId", "email name").populate("projectId", "title");

            if (contract) {
              const charge = paymentIntent.latest_charge ? await stripe.charges.retrieve(paymentIntent.latest_charge as string) : null;
              
              await Transaction.create({
                contractId: contract._id,
                clientId: contract.clientId,
                freelancerId: contract.freelancerId,
                amount: contract.agreedRate,
                type: "funding",
                stripePaymentIntentId: paymentIntent.id,
                metadata: {
                  cardBrand: charge?.payment_method_details?.card?.brand,
                  cardLast4: charge?.payment_method_details?.card?.last4,
                  receiptUrl: charge?.receipt_url,
                },
              });

              // Notify the freelancer that payment was secured
              void notify([contract.freelancerId._id], {
                type: "contract_update",
                title: "Payment secured",
                body: `The client has successfully funded the contract.`,
                link: `/contracts/${contractId}`,
              });
              
              // Email the freelancer
              const projectTitle = (contract.projectId as any)?.title || "Direct Contract";
              sendEmail({
                to: (contract.freelancerId as any).email,
                subject: `Contract Funded: ${projectTitle}`,
                html: contractFundedEmail(projectTitle, contract.agreedRate),
                category: "contracts",
              }).catch(console.error);
            }
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Record<string, any>;
        const paymentIntentId = charge.payment_intent as string;
        
        if (paymentIntentId) {
          console.log(`[Webhook] Charge refunded for payment intent ${paymentIntentId}`);
          
          const existingTx = await Transaction.findOne({
            stripePaymentIntentId: paymentIntentId,
            type: "refund",
          });

          if (!existingTx) {
            const fundingTx = await Transaction.findOne({
              stripePaymentIntentId: paymentIntentId,
              type: "funding",
            });

            if (fundingTx) {
              await Transaction.create({
                contractId: fundingTx.contractId,
                clientId: fundingTx.clientId,
                freelancerId: fundingTx.freelancerId,
                amount: fundingTx.amount,
                type: "refund",
                stripePaymentIntentId: paymentIntentId,
                metadata: {
                  refundedAt: new Date(),
                },
              });

              await Contract.findByIdAndUpdate(fundingTx.contractId, {
                paymentStatus: "refunded",
              });
            }
          }
        }
        break;
      }
      
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Record<string, any>;
        const contractId = paymentIntent.metadata?.contractId;
        const errorMessage = paymentIntent.last_payment_error?.message;

        if (contractId) {
          console.error(`[Webhook] Payment failed for contract ${contractId}: ${errorMessage}`);
          const contract = await Contract.findById(contractId).populate("clientId", "email name").populate("projectId", "title");
          if (contract) {
             // Notify the client that their payment failed
             void notify([contract.clientId._id], {
               type: "contract_update",
               title: "Payment failed",
               body: `Your payment attempt failed: ${errorMessage || 'Unknown error'}. Please try again.`,
               link: `/contracts/${contractId}`,
             });
             
             const projectTitle = (contract.projectId as any)?.title || "Direct Contract";
             sendEmail({
               to: (contract.clientId as any).email,
               subject: `Payment Failed: ${projectTitle}`,
               html: paymentFailedEmail(projectTitle, errorMessage || 'Unknown error'),
               category: "system",
             }).catch(console.error);
          }
        }
        break;
      }

      // Ignore other event types
      default:
        console.log(`[Webhook] Unhandled event type ${event.type}`);
    }

    // 3. Always return a 200 immediately so Stripe knows we received the event
    // If we return 500, Stripe will retry for up to 3 days.
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("[Webhook] Internal error processing webhook:", error);
    // Don't return 500 here if it's a non-retriable internal error, but for robust systems,
    // you might want Stripe to retry if your DB is temporarily down.
    return new Response("Internal Server Error", { status: 500 });
  }
}
