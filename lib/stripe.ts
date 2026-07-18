import Stripe from "stripe";

// Check for the secret key, fail gracefully in development
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

if (!stripeSecretKey) {
  console.warn("STRIPE_SECRET_KEY is missing. Payment APIs will fail.");
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-12-18.acacia", // Always pin to a specific, stable API version
  appInfo: {
    name: "SkillSync",
    version: "0.1.0",
  },
});
