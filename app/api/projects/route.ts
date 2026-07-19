import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession, parsePagination } from "@/lib/api-utils";
import { Project } from "@/models/Project";
import { updateProjectEmbedding } from "@/lib/ai/matching";

const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createProjectSchema = z.object({
  title: z.string().min(4, "Title must be at least 4 characters.").max(200),
  description: z.string().min(20, "Description must be at least 20 characters.").max(5000),
  category: z.string().min(1, "Category is required."),
  skills: z.array(z.string()).max(5, "Maximum 5 skills allowed.").default([]),
  budgetType: z.enum(["fixed", "hourly"]).default("fixed"),
  budgetMin: z.number().min(0).default(0),
  budgetMax: z.number().min(0).default(0),
  hourlyRate: z.number().min(0).default(0),
  estimatedHours: z.number().min(0).default(0),
  timeline: z.string().max(100).default(""),
  experienceLevel: z.enum(["beginner", "intermediate", "expert"]).default("intermediate"),
  attachments: z.array(z.string()).max(5).default([]),
}).refine(
  (data) => {
    if (data.budgetType === "fixed") {
      return data.budgetMax >= data.budgetMin;
    }
    return true; // hourly doesn't use budgetMin/Max strictly in the same way here, though UI might
  },
  {
    message: "Maximum budget must be greater than or equal to minimum budget.",
    path: ["budgetMax"],
  }
);

/**
 * POST /api/projects — Create a new project (auth required).
 */
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    
    // Restrict to client role only
    if (session.user.role !== "client") {
      return NextResponse.json(
        { error: "Only clients can post projects." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const project = await Project.create({
      ...parsed.data,
      postedBy: session.user.id,
      status: "open",
    });

    // Fire and forget embedding generation
    void updateProjectEmbedding(project._id.toString());

    return NextResponse.json({ data: project.toJSON() }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[POST /api/projects]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/**
 * GET /api/projects — List projects with filters (public).
 * ?status=open&category=design&q=search&page=1&limit=12&clientId=123
 */
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const status = searchParams.get("status")?.trim();
    const category = searchParams.get("category")?.trim();
    const q = searchParams.get("q")?.trim();
    const clientId = searchParams.get("clientId")?.trim();
    
    // New filters
    const budgetType = searchParams.get("budgetType")?.trim();
    const minBudget = parseFloat(searchParams.get("minBudget") ?? "0") || 0;
    const maxBudget = parseFloat(searchParams.get("maxBudget") ?? "0") || 0;
    const experienceLevel = searchParams.get("experienceLevel")?.trim();
    const sort = searchParams.get("sort")?.trim() || "newest";

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (clientId) filter.postedBy = clientId;
    if (experienceLevel && experienceLevel !== "Any") {
      filter.experienceLevel = experienceLevel.toLowerCase();
    }
    
    if (budgetType && budgetType !== "Any") {
      filter.budgetType = budgetType.toLowerCase();
    }

    if (minBudget > 0 || maxBudget > 0) {
      if (filter.budgetType === "hourly") {
        if (minBudget > 0) filter.hourlyRate = { ...((filter.hourlyRate as any) || {}), $gte: minBudget };
        if (maxBudget > 0) filter.hourlyRate = { ...((filter.hourlyRate as any) || {}), $lte: maxBudget };
      } else if (filter.budgetType === "fixed") {
        if (minBudget > 0) filter.budgetMax = { ...((filter.budgetMax as any) || {}), $gte: minBudget };
        if (maxBudget > 0) filter.budgetMin = { ...((filter.budgetMin as any) || {}), $lte: maxBudget };
      } else {
        // If budgetType isn't specified but range is, it's ambiguous. 
        // We'll apply it broadly via $or, or just require budgetType for range filtering.
        // For simplicity, let's just check fixed budgetMax/budgetMin if no type specified.
        filter.$or = [
          { hourlyRate: { $gte: minBudget || 0, ...(maxBudget > 0 ? { $lte: maxBudget } : {}) } },
          { 
            budgetMax: { $gte: minBudget || 0 },
            ...(maxBudget > 0 ? { budgetMin: { $lte: maxBudget } } : {})
          }
        ];
      }
    }

    if (q) {
      const safeQ = escapeRegExp(q);
      const qRegex = { $regex: safeQ, $options: "i" };
      
      // If we already have an $or from the budget filter, we must use $and
      const textMatch = {
        $or: [
          { title: qRegex },
          { description: qRegex },
          { skills: qRegex },
        ]
      };
      
      if (filter.$or) {
        filter.$and = [ { $or: filter.$or }, textMatch ];
        delete filter.$or;
      } else {
        filter.$or = textMatch.$or;
      }
    }

    let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "budget") {
      // Sort by highest budget Max or hourly rate
      sortObj = { budgetMax: -1, hourlyRate: -1 };
    }

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate("postedBy", "name image headline rating")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(filter),
    ]);

    const data = projects.map((p) => ({
      ...p,
      id: p._id?.toString(),
      _id: undefined,
      __v: undefined,
    }));

    return NextResponse.json({
      data: {
        projects: data,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
