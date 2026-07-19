import { Project, ProjectDocument } from "@/models/Project";
import { User, UserDocument } from "@/models/User";
import { Skill } from "@/models/Skill";
import { generateEmbedding, generateText, aiEnabled, AIUnavailableError } from "./index";
import { SchemaType } from "@google/generative-ai";
import { connectToDatabase } from "@/lib/mongodb";

/**
 * Normalizes and concatenates project fields for embedding generation.
 */
export function generateProjectEmbeddingText(project: ProjectDocument): string {
  const parts = [
    project.title,
    project.description,
    project.skills?.join(", ") || "",
  ];
  return parts.filter(Boolean).join(". ");
}

/**
 * Normalizes and concatenates user profile + gigs for embedding generation.
 */
export async function generateUserEmbeddingText(user: UserDocument): Promise<string> {
  const parts = [
    user.headline || "",
    user.bio || "",
    user.skills?.join(", ") || "",
  ];

  // Fetch gigs (skills)
  const gigs = await Skill.find({ userId: (user as any)._id }).lean();
  if (gigs && gigs.length > 0) {
    const gigText = gigs.map(g => `${g.title}: ${g.description}`).join(". ");
    parts.push(gigText);
  }

  return parts.filter(Boolean).join(". ");
}

export async function updateProjectEmbedding(projectId: string) {
  if (!aiEnabled()) return;
  await connectToDatabase();
  const project = await Project.findById(projectId);
  if (!project) return;

  const text = generateProjectEmbeddingText(project);
  if (text.trim().length < 10) return; // Too short to matter

  try {
    const embedding = await generateEmbedding(text);
    await Project.findByIdAndUpdate(projectId, { embedding });
  } catch (e) {
    console.error(`[AI] Failed to update project embedding ${projectId}`, e);
  }
}

export async function updateUserEmbedding(userId: string) {
  if (!aiEnabled()) return;
  await connectToDatabase();
  const user = await User.findById(userId);
  if (!user || user.role !== "freelancer") return;

  const text = await generateUserEmbeddingText(user);
  if (text.trim().length < 10) return;

  try {
    const embedding = await generateEmbedding(text);
    await User.findByIdAndUpdate(userId, { embedding });
  } catch (e) {
    console.error(`[AI] Failed to update user embedding ${userId}`, e);
  }
}

/**
 * Cosine similarity between two vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i] ?? 0;
    const b = vecB[i] ?? 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Finds top similar users using cosine similarity over pre-filtered category set.
 */
export async function findSimilarUsers(projectEmbedding: number[], category: string, limit = 15): Promise<UserDocument[]> {
  await connectToDatabase();
  const candidates = await User.find({ role: "freelancer", categories: category }).lean();
  
  if (!projectEmbedding || projectEmbedding.length === 0) return candidates.slice(0, limit) as UserDocument[];

  const scored = candidates.map(c => ({
    user: c,
    score: cosineSimilarity(projectEmbedding, c.embedding || []),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.user) as UserDocument[];
}

/**
 * Finds top similar projects using cosine similarity over pre-filtered category set.
 */
export async function findSimilarProjects(userEmbedding: number[], category: string, limit = 15): Promise<ProjectDocument[]> {
  await connectToDatabase();
  const candidates = await Project.find({ status: "open", category }).lean();
  
  if (!userEmbedding || userEmbedding.length === 0) return candidates.slice(0, limit) as ProjectDocument[];

  const scored = candidates.map(p => ({
    project: p,
    score: cosineSimilarity(userEmbedding, p.embedding || []),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.project) as ProjectDocument[];
}

// Zod-equivalent schema definition for Gemini's native Schema type
import { Schema } from "@google/generative-ai";
const rerankResponseSchema: Schema = {
  type: SchemaType.ARRAY,
  description: "A list of candidates with match scores and concrete reasons.",
  items: {
    type: SchemaType.OBJECT,
    properties: {
      candidateId: { 
        type: SchemaType.STRING, 
        description: "The _id of the candidate."
      },
      matchPercentage: { 
        type: SchemaType.INTEGER, 
        description: "Match score between 0 and 100 based on fit."
      },
      reasons: {
        type: SchemaType.ARRAY,
        description: "Exactly two concrete reasons grounded in specific details from the actual profiles, not generic filler text.",
        items: {
          type: SchemaType.STRING,
        },
      }
    },
    required: ["candidateId", "matchPercentage", "reasons"]
  }
};

/**
 * Uses Gemini to rerank candidates (users) for a specific project.
 */
export async function rerankFreelancersForProject(project: ProjectDocument, candidates: UserDocument[]) {
  if (!aiEnabled()) throw new AIUnavailableError("AI disabled");
  if (candidates.length === 0) return [];

  const candidatePayload = candidates.map(c => ({
    candidateId: (c as any)._id?.toString(),
    name: c.name,
    headline: c.headline,
    bio: c.bio,
    skills: c.skills,
  }));

  const systemPrompt = `You are an expert technical recruiter matching freelancers to open projects. 
Given a Project Description and a list of Candidate Freelancers, evaluate their fit. 
For each candidate, provide a matchPercentage (0-100) and EXACTLY TWO concrete reasons why they match, referencing specific skills or experiences from their profile versus the project's requirements. Do not use generic filler.`;

  const userContent = `PROJECT:
Title: ${project.title}
Description: ${project.description}
Skills required: ${project.skills?.join(", ")}

CANDIDATES:
${JSON.stringify(candidatePayload, null, 2)}`;

  const response = await generateText({
    systemPrompt,
    userContent,
    responseSchema: rerankResponseSchema,
  });

  try {
    return JSON.parse(response) as { candidateId: string, matchPercentage: number, reasons: string[] }[];
  } catch (e) {
    throw new AIUnavailableError("Failed to parse Gemini rerank response.");
  }
}

/**
 * Uses Gemini to rerank candidates (projects) for a specific freelancer.
 */
export async function rerankProjectsForFreelancer(user: UserDocument, candidates: ProjectDocument[]) {
  if (!aiEnabled()) throw new AIUnavailableError("AI disabled");
  if (candidates.length === 0) return [];

  const candidatePayload = candidates.map(p => ({
    candidateId: (p as any)._id?.toString(),
    title: p.title,
    description: p.description,
    skills: p.skills,
  }));

  const systemPrompt = `You are an expert technical recruiter matching open projects to a specific freelancer. 
Given a Freelancer Profile and a list of Candidate Projects, evaluate the fit. 
For each candidate project, provide a matchPercentage (0-100) and EXACTLY TWO concrete reasons why the project is a good fit, referencing specific skills or experiences from the freelancer's profile versus the project's requirements. Do not use generic filler.`;

  const userContent = `FREELANCER PROFILE:
Name: ${user.name}
Headline: ${user.headline}
Bio: ${user.bio}
Skills: ${user.skills?.join(", ")}

CANDIDATE PROJECTS:
${JSON.stringify(candidatePayload, null, 2)}`;

  const response = await generateText({
    systemPrompt,
    userContent,
    responseSchema: rerankResponseSchema,
  });

  try {
    return JSON.parse(response) as { candidateId: string, matchPercentage: number, reasons: string[] }[];
  } catch (e) {
    throw new AIUnavailableError("Failed to parse Gemini rerank response.");
  }
}
