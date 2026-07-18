/**
 * Database seed script. Run with `npx tsx scripts/seed.ts` or `npm run seed`.
 *
 * Creates realistic development data.
 * Clears collections in reverse dependency order, then seeds.
 */
import "dotenv/config";
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

// Random utility functions
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];
const randomElements = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const CATEGORIES = [
  "web-development",
  "mobile-development",
  "design",
  "writing",
  "marketing",
  "video-animation",
  "data-science",
  "customer-support",
];

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
    isVerified: true,
  });

  // 10 Experts
  const experts = [];
  for (let i = 1; i <= 10; i++) {
    const expert = await User.create({
      name: `Expert User ${i}`,
      email: `expert${i}@skillsync.dev`,
      passwordHash: userPasswordHash,
      role: "provider",
      headline: randomElement(["Senior Full-Stack Engineer", "UI/UX Designer", "Technical Writer", "Data Scientist", "Digital Marketer"]),
      bio: `I am an experienced professional looking for exciting projects. This is expert number ${i}.`,
      location: randomElement(LOCATIONS),
      hourlyRate: randomInt(15, 150),
      isVerified: true,
      image: `https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&q=80&w=256&h=256`, // Fake unsplash ids
      skills: ["React", "Node.js", "TypeScript", "Figma", "Python"].slice(0, randomInt(1, 5)),
    });
    experts.push(expert);
  }

  // 5 Learners (Clients)
  const learners = [];
  for (let i = 1; i <= 5; i++) {
    const learner = await User.create({
      name: `Learner User ${i}`,
      email: `learner${i}@skillsync.dev`,
      passwordHash: userPasswordHash,
      role: "member",
      headline: "Startup Founder",
      bio: `Looking for top talent to build my next big idea. I am learner number ${i}.`,
      location: randomElement(LOCATIONS),
      isVerified: true,
    });
    learners.push(learner);
  }

  console.log("Seeding Skills...");
  const skills = [];
  for (let i = 1; i <= 30; i++) {
    const expert = randomElement(experts);
    const category = randomElement(CATEGORIES);
    const title = `Professional ${category.replace("-", " ")} Services ${i}`;
    const skill = await Skill.create({
      providerId: expert._id,
      title,
      slug: slugify(title) + `-${i}`,
      category,
      description: `I will provide high-quality ${category} services tailored to your needs. With years of experience, I can deliver outstanding results.`,
      hourlyRate: expert.hourlyRate || randomInt(20, 100),
      level: randomElement(["beginner", "intermediate", "advanced", "expert"]),
      tags: [category, "professional", "reliable"],
    });
    skills.push(skill);
  }

  console.log("Seeding Projects...");
  const projects = [];
  for (let i = 1; i <= 20; i++) {
    const client = randomElement(learners);
    const budgetType = randomElement(["fixed", "hourly"]);
    const project = await Project.create({
      postedBy: client._id,
      title: `Need a ${randomElement(CATEGORIES).replace("-", " ")} expert for project ${i}`,
      description: "We are looking for a skilled professional to help us with an exciting new project. Please apply if you meet the requirements.",
      category: randomElement(CATEGORIES),
      skillsRequired: ["React", "Node.js", "Design"],
      experienceLevel: randomElement(["beginner", "intermediate", "expert"]),
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
  const proposals = [];
  // 15 proposals spread across projects
  for (let i = 1; i <= 15; i++) {
    const project = randomElement(projects);
    const expert = randomElement(experts);
    
    // Prevent duplicate proposals if they randomly hit the same project/expert
    const exists = await Proposal.findOne({ projectId: project._id, freelancerId: expert._id });
    if (exists) continue;

    const status = randomElement(["pending", "accepted", "rejected"]);
    const proposal = await Proposal.create({
      projectId: project._id,
      freelancerId: expert._id,
      message: `I am highly interested in your project and have the right skills to deliver exactly what you need.`,
      proposedRate: randomInt(500, 2000),
      timeline: "< 1 month",
      status,
    });
    proposals.push(proposal);
  }

  console.log("Seeding Contracts...");
  const contracts = [];
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
  const reviews = [];
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

    // Freelancer reviews client
    const expertReview = await Review.create({
      reviewerId: contract.freelancerId,
      targetId: contract.clientId,
      contractId: contract._id,
      rating: randomInt(4, 5),
      comment: "Great client to work with. Clear requirements and prompt payment.",
    });
    reviews.push(expertReview);
  }

  console.log("Seeding Notifications...");
  const notifications = [];
  for (let i = 1; i <= 50; i++) {
    const user = randomElement([...experts, ...learners]);
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
  console.log(`Users: ${experts.length + learners.length + 1} (1 Admin, ${experts.length} Experts, ${learners.length} Learners)`);
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
