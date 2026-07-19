import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { connectToDatabase } from "../lib/mongodb";
import { Project } from "../models/Project";
import { User } from "../models/User";
import { updateProjectEmbedding, updateUserEmbedding } from "../lib/ai/matching";
import { aiEnabled } from "../lib/ai";

dotenv.config({ path: ".env.local" });

async function run() {
  if (!aiEnabled()) {
    console.error("AI is disabled. Cannot run backfill script.");
    process.exit(1);
  }

  await connectToDatabase();
  console.log("Connected to MongoDB");

  const users = await User.find({ role: "freelancer", $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }] });
  console.log(`Found ${users.length} freelancers needing embeddings.`);
  for (const user of users) {
    try {
      await updateUserEmbedding(user._id.toString());
      console.log(`Updated user ${user._id}`);
      // Simple delay to respect rate limits
      await new Promise(res => setTimeout(res, 2000));
    } catch (e: any) {
      console.error(`Failed to update user ${user._id}`, e.message);
    }
  }

  const projects = await Project.find({ $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }] });
  console.log(`Found ${projects.length} projects needing embeddings.`);
  for (const project of projects) {
    try {
      await updateProjectEmbedding(project._id.toString());
      console.log(`Updated project ${project._id}`);
      await new Promise(res => setTimeout(res, 2000));
    } catch (e: any) {
      console.error(`Failed to update project ${project._id}`, e.message);
    }
  }

  console.log("Backfill complete.");
  process.exit(0);
}

run().catch(err => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
