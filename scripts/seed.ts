/**
 * Database seed script. Run with `npm run seed`.
 *
 * Loads .env.local, connects to MongoDB, creates a demo provider, and inserts
 * the static seed skills owned by that provider. Idempotent-ish: it upserts the
 * demo user and skips skills whose slug already exists.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";

import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Skill } from "@/models/Skill";
import { seedSkills } from "@/data/skills";
import { slugify } from "@/lib/utils";

async function main() {
  await connectToDatabase();
  console.log("Connected to MongoDB.");

  const passwordHash = await bcrypt.hash("Password123", 12);
  const provider = await User.findOneAndUpdate(
    { email: "demo.provider@skillsync.dev" },
    {
      $setOnInsert: {
        name: "Demo Provider",
        email: "demo.provider@skillsync.dev",
        passwordHash,
        role: "provider",
        headline: "Full-stack engineer & mentor",
      },
    },
    { upsert: true, new: true }
  );
  console.log(`Provider ready: ${provider.email}`);

  for (const skill of seedSkills) {
    const slug = slugify(skill.title);
    const exists = await Skill.findOne({ slug });
    if (exists) {
      console.log(`Skipping existing skill: ${slug}`);
      continue;
    }
    await Skill.create({ ...skill, slug, providerId: provider._id });
    console.log(`Inserted skill: ${slug}`);
  }

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
