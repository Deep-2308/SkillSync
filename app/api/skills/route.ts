import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession, parsePagination } from "@/lib/api-utils";
import { Skill } from "@/models/Skill";

const createSkillSchema = z.object({
  title: z.string().min(4, "Title must be at least 4 characters.").max(120),
  description: z.string().min(20, "Description must be at least 20 characters.").max(2000),
  category: z.string().min(1, "Category is required."),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]).default("intermediate"),
  hourlyRate: z.number().min(0, "Rate cannot be negative.").max(10000),
  tags: z.array(z.string()).max(10).default([]),
  portfolioUrls: z.array(z.string().url()).max(5).default([]),
  experience: z.string().max(200).default(""),
});

/**
 * Generates a URL-friendly slug from a title.
 */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * POST /api/skills — Create skill listing (freelancer role only).
 */
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (session.user.role !== "freelancer") {
      return NextResponse.json(
        { error: "Only freelancers can create skill listings." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createSkillSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Generate unique slug
    const baseSlug = slugify(parsed.data.title);
    let slug = baseSlug;
    let counter = 1;
    while (await Skill.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const skill = await Skill.create({
      ...parsed.data,
      slug,
      providerId: session.user.id,
    });

    return NextResponse.json({ data: skill.toJSON() }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[POST /api/skills]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/**
 * GET /api/skills — List skills with filters (public).
 * ?category=webdev&level=expert&q=react&sort=rating&page=1&limit=12
 */
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const category = searchParams.get("category")?.trim();
    const level = searchParams.get("level")?.trim();
    const q = searchParams.get("q")?.trim();
    const sort = searchParams.get("sort") ?? "newest";

    const filter: Record<string, unknown> = { isPublished: true };
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (q) {
      const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const safeQ = escapeRegExp(q);
      filter.$or = [
        { title: { $regex: safeQ, $options: "i" } },
        { description: { $regex: safeQ, $options: "i" } },
        { tags: { $regex: safeQ, $options: "i" } },
      ];
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      rating: { rating: -1 },
      rate: { hourlyRate: 1 },
      newest: { createdAt: -1 },
      popular: { reviewCount: -1 },
    };

    const [skills, total] = await Promise.all([
      Skill.find(filter)
        .populate("providerId", "name image headline location")
        .sort(sortMap[sort] ?? { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Skill.countDocuments(filter),
    ]);

    const data = skills.map((s) => ({
      ...s,
      id: s._id?.toString(),
      _id: undefined,
      __v: undefined,
    }));

    return NextResponse.json({
      data: {
        skills: data,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/skills]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
