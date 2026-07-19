/**
 * Database seed script. Run with `npx tsx scripts/seed.ts` or `npm run seed`.
 *
 * Creates realistic development data.
 * Clears collections in reverse dependency order, then seeds.
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Skill } from "@/models/Skill";
import { Project } from "@/models/Project";
import { Proposal } from "@/models/Proposal";
import { Contract } from "@/models/Contract";
import { Review } from "@/models/Review";
import { Notification } from "@/models/Notification";
import { slugify } from "@/lib/utils";
import { categoryNames } from "@/data/categories";
import { recalculateUserRating } from "@/lib/reviews";

// Random utility functions
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)] as T;
const randomElements = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Canonical category display names — the same values the forms submit.
const CATEGORIES = categoryNames;

const LOCATIONS = ["US", "UK", "India", "Canada", "Germany", "Australia", "Remote"];

async function main() {
  await connectToDatabase();
  console.log("Connected to MongoDB.");

  console.log("Clearing collections...");
  // Clear in reverse dependency order
  await Review.deleteMany({});
  await Notification.deleteMany({});
  await Contract.deleteMany({});
  await Proposal.deleteMany({});
  await Project.deleteMany({});
  await Skill.deleteMany({});
  await User.deleteMany({});
  console.log("Collections cleared.");

  const passwordHash = await bcrypt.hash("Admin@123", 12);
  const userPasswordHash = await bcrypt.hash("Password123", 12);

  console.log("Seeding Users...");

  // 1 Admin
  const admin = await User.create({
    name: "Admin User",
    email: "admin@skillsync.com",
    passwordHash,
    role: "admin",
    headline: "System Administrator",
    bio: "Platform administrator.",
  });

  // 10 Freelancers
  const freelancers: any[] = [];
  for (let i = 1; i <= 10; i++) {
    const freelancer = await User.create({
      name: `Freelancer User ${i}`,
      email: `freelancer${i}@skillsync.dev`,
      passwordHash: userPasswordHash,
      role: "freelancer",
      headline: randomElement(["Senior Full-Stack Engineer", "UI/UX Designer", "Technical Writer", "Data Scientist", "Digital Marketer"]),
      bio: `I am an experienced professional looking for exciting projects. This is freelancer number ${i}.`,
      location: randomElement(LOCATIONS),
      hourlyRate: randomInt(15, 150),
      image: `https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&q=80&w=256&h=256`, // Fake unsplash ids
      skills: ["React", "Node.js", "TypeScript", "Figma", "Python"].slice(0, randomInt(1, 5)),
    });
    freelancers.push(freelancer);
  }

  // 5 Clients
  const clients: any[] = [];
  for (let i = 1; i <= 5; i++) {
    const clientUser = await User.create({
      name: `Client User ${i}`,
      email: `client${i}@skillsync.dev`,
      passwordHash: userPasswordHash,
      role: "client",
      headline: "Startup Founder",
      bio: `Looking for top talent to build my next big idea. I am client number ${i}.`,
      location: randomElement(LOCATIONS),
    });
    clients.push(clientUser);
  }

  console.log("Seeding Skills...");
  const skills: any[] = [];
  for (let i = 1; i <= 30; i++) {
    const freelancer = randomElement(freelancers);
    const category = randomElement(CATEGORIES);
    const title = `Professional ${category} Services ${i}`;
    const skill = await Skill.create({
      providerId: freelancer._id,
      title,
      slug: slugify(title) + `-${i}`,
      category,
      description: `I will provide high-quality ${category} services tailored to your needs. With years of experience, I can deliver outstanding results.`,
      hourlyRate: freelancer.hourlyRate || randomInt(20, 100),
      level: randomElement(["beginner", "intermediate", "advanced", "expert"]),
      tags: [category, "professional", "reliable"],
    });
    skills.push(skill);
  }

  console.log("Seeding Projects...");
  const projects: any[] = [];
  for (let i = 1; i <= 20; i++) {
    const client = randomElement(clients);
    const budgetType = randomElement(["fixed", "hourly"]) as "fixed" | "hourly";
    const project = await Project.create({
      postedBy: client._id,
      title: `Need a ${randomElement(CATEGORIES)} freelancer for project ${i}`,
      description: "We are looking for a skilled professional to help us with an exciting new project. Please apply if you meet the requirements.",
      category: randomElement(CATEGORIES),
      skills: ["React", "Node.js", "Design"],
      experienceLevel: randomElement(["beginner", "intermediate", "expert"]) as "beginner" | "intermediate" | "expert",
      budgetType,
      budgetMin: budgetType === "fixed" ? randomInt(500, 1000) : undefined,
      budgetMax: budgetType === "fixed" ? randomInt(1000, 5000) : undefined,
      hourlyRate: budgetType === "hourly" ? randomInt(20, 150) : undefined,
      estimatedHours: budgetType === "hourly" ? randomInt(10, 100) : undefined,
      timeline: "< 1 month",
      status: "open",
    });
    projects.push(project);
  }

  console.log("Seeding Proposals...");
  const proposals: any[] = [];
  // 15 proposals spread across projects
  for (let i = 1; i <= 15; i++) {
    const project = randomElement(projects);
    const freelancer = randomElement(freelancers);
    
    // Prevent duplicate proposals if they randomly hit the same project/freelancer
    const exists = await Proposal.findOne({ projectId: project._id, freelancerId: freelancer._id });
    if (exists) continue;

    const status = randomElement(["pending", "accepted", "rejected"]) as "pending" | "accepted" | "rejected";
    const proposal = await Proposal.create({
      projectId: project._id,
      freelancerId: freelancer._id,
      message: `I am highly interested in your project and have the right skills to deliver exactly what you need.`,
      proposedRate: randomInt(500, 2000),
      timeline: "< 1 month",
      status,
    });
    proposals.push(proposal);
  }

  console.log("Seeding Contracts...");
  const contracts: any[] = [];
  // 10 contracts based on accepted proposals
  const acceptedProposals = proposals.filter((p) => p.status === "accepted");
  for (let i = 0; i < Math.min(10, acceptedProposals.length); i++) {
    const prop = acceptedProposals[i];
    const project = projects.find(p => p._id.toString() === prop.projectId.toString());
    if (!project) continue;

    const status = i < 5 ? "completed" : "active";
    const paymentStatus = status === "completed" ? "paid" : "pending";

    const contract = await Contract.create({
      projectId: prop.projectId,
      proposalId: prop._id,
      clientId: project.postedBy,
      freelancerId: prop.freelancerId,
      agreedRate: prop.proposedRate,
      timeline: prop.timeline,
      status,
      paymentStatus,
    });
    contracts.push(contract);

    // Update project status if contract is completed
    if (status === "completed") {
       await Project.findByIdAndUpdate(project._id, { status: "completed" });
    }
  }

  console.log("Seeding Reviews...");
  const reviews: any[] = [];
  const completedContracts = contracts.filter(c => c.status === "completed");
  for (const contract of completedContracts) {
    // Client reviews freelancer
    const clientReview = await Review.create({
      reviewerId: contract.clientId,
      targetId: contract.freelancerId,
      contractId: contract._id,
      rating: randomInt(4, 5),
      comment: "Excellent work! Delivered on time and exceeded expectations. Will hire again.",
    });
    reviews.push(clientReview);
    await recalculateUserRating(contract.freelancerId.toString());

    // Freelancer reviews client
    const freelancerReview = await Review.create({
      reviewerId: contract.freelancerId,
      targetId: contract.clientId,
      contractId: contract._id,
      rating: randomInt(4, 5),
      comment: "Great client to work with. Clear requirements and prompt payment.",
    });
    reviews.push(freelancerReview);
    await recalculateUserRating(contract.clientId.toString());
  }

  console.log("Seeding Notifications...");
  const notifications: any[] = [];
  for (let i = 1; i <= 50; i++) {
    const user = randomElement([...freelancers, ...clients]);
    const notif = await Notification.create({
      userId: user._id,
      type: randomElement(["system", "contract_update", "proposal_received"]),
      title: "New update on your account",
      body: "This is an automated system notification for seeding purposes.",
      link: "/dashboard",
      read: Math.random() > 0.5,
    });
    notifications.push(notif);
  }

  console.log(`\n--- Seed Summary ---`);
  console.log(`Users: ${freelancers.length + clients.length + 1} (1 Admin, ${freelancers.length} Freelancers, ${clients.length} Clients)`);
  console.log(`Skills: ${skills.length}`);
  console.log(`Projects: ${projects.length}`);
  console.log(`Proposals: ${proposals.length}`);
  console.log(`Contracts: ${contracts.length}`);
  console.log(`Reviews: ${reviews.length}`);
  console.log(`Notifications: ${notifications.length}`);
  console.log(`--------------------\n`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
