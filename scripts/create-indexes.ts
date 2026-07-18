/**
 * Index optimization script. Run with `npx tsx scripts/create-indexes.ts`
 *
 * Explicitly creates compound performance indexes in the background to avoid
 * blocking production traffic during deployment or scaling phases.
 */
import "dotenv/config";
import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Skill } from "@/models/Skill";
import { Project } from "@/models/Project";
import { Proposal } from "@/models/Proposal";
import { Contract } from "@/models/Contract";
import { Review } from "@/models/Review";
import { Notification } from "@/models/Notification";

async function main() {
  console.log("Connecting to MongoDB...");
  await connectToDatabase();
  console.log("Connected.");

  console.log("Creating compound indexes in the background...");

  try {
    // Users: { role: 1, isVerified: 1, availability: 1 } for freelancer listing
    await User.collection.createIndex(
      { role: 1, isVerified: 1, availability: 1 },
      { background: true, name: "freelancer_listing_idx" }
    );
    console.log("Created User freelancer_listing_idx");

    // Projects: { status: 1, category: 1, createdAt: -1 } for project listing
    await Project.collection.createIndex(
      { status: 1, category: 1, createdAt: -1 },
      { background: true, name: "project_listing_idx" }
    );
    console.log("Created Project project_listing_idx");

    // Skills: { category: 1, isAvailable: 1, rate: 1 } for skill search
    await Skill.collection.createIndex(
      { category: 1, isAvailable: 1, rate: 1 },
      { background: true, name: "skill_search_idx" }
    );
    console.log("Created Skill skill_search_idx");

    // Proposals: { projectId: 1, status: 1 } for project proposal list
    await Proposal.collection.createIndex(
      { projectId: 1, status: 1 },
      { background: true, name: "proposal_status_idx" }
    );
    console.log("Created Proposal proposal_status_idx");

    // Contracts: { clientId: 1, status: 1, createdAt: -1 } for dashboard
    await Contract.collection.createIndex(
      { clientId: 1, status: 1, createdAt: -1 },
      { background: true, name: "client_dashboard_idx" }
    );
    console.log("Created Contract client_dashboard_idx");

    // Reviews: { targetId: 1, createdAt: -1 } for profile reviews
    await Review.collection.createIndex(
      { targetId: 1, createdAt: -1 },
      { background: true, name: "profile_reviews_idx" }
    );
    console.log("Created Review profile_reviews_idx");

    // Notifications: { userId: 1, isRead: 1, createdAt: -1 } for notification bell
    // Assuming field is named 'read' based on Notification schema
    await Notification.collection.createIndex(
      { userId: 1, read: 1, createdAt: -1 },
      { background: true, name: "notification_bell_idx" }
    );
    console.log("Created Notification notification_bell_idx");

    console.log("\nAll background indexes initiated successfully.");
    console.log("Note: Depending on DB size, they may take time to fully build on the server.");
  } catch (error) {
    console.error("Error creating indexes:", error);
    process.exit(1);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
