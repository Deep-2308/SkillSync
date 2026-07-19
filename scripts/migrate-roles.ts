/**
 * One-off role migration: member → client, provider → freelancer.
 *
 * Run with: npx tsx scripts/migrate-roles.ts
 *
 * Uses raw collection updates (not Mongoose models) so the write is not
 * blocked by the User schema's new enum, which no longer contains the old
 * role values. Idempotent — running twice is a no-op.
 */
import "dotenv/config";
import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";

async function main() {
  console.log("Connecting to MongoDB...");
  await connectToDatabase();
  console.log("Connected.");

  const users = mongoose.connection.collection("users");

  const [members, providers] = await Promise.all([
    users.updateMany({ role: "member" }, { $set: { role: "client" } }),
    users.updateMany({ role: "provider" }, { $set: { role: "freelancer" } }),
  ]);

  console.log(`member   → client:     ${members.modifiedCount} document(s)`);
  console.log(`provider → freelancer: ${providers.modifiedCount} document(s)`);

  // Sanity check: no documents should remain with the old role values.
  const leftovers = await users.countDocuments({
    role: { $in: ["member", "provider"] },
  });
  if (leftovers > 0) {
    console.error(`WARNING: ${leftovers} document(s) still carry old roles.`);
    process.exitCode = 1;
  } else {
    console.log("Migration complete — no old role values remain.");
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
