import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession, isValidObjectId } from "@/lib/api-utils";
import { Skill } from "@/models/Skill";
import { updateUserEmbedding } from "@/lib/ai/matching";

const updateSkillSchema = z.object({
  title: z.string().min(4).max(120).optional(),
  description: z.string().min(20).max(2000).optional(),
  category: z.string().min(1).optional(),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
  hourlyRate: z.number().min(0).max(10000).optional(),
  tags: z.array(z.string()).max(10).optional(),
  isPublished: z.boolean().optional(),
  deliveryTime: z.string().min(1).max(50).optional(),
  revisions: z.number().min(0).max(50).optional(),
});

/**
 * GET /api/skills/[id] — Single skill detail (populate provider).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const badId = isValidObjectId(id);
    if (badId) return badId;

    await connectToDatabase();

    const skill = await Skill.findById(id)
      .populate("providerId", "name image headline location role bio skills");

    if (!skill) {
      return NextResponse.json({ error: "Skill not found." }, { status: 404 });
    }

    return NextResponse.json({ data: skill.toJSON() });
  } catch (error) {
    console.error("[GET /api/skills/[id]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/**
 * PUT /api/skills/[id] — Update skill (only owner).
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    const { id } = await params;
    const badId = isValidObjectId(id);
    if (badId) return badId;

    const body = await request.json();
    const parsed = updateSkillSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const skill = await Skill.findById(id);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found." }, { status: 404 });
    }

    if (skill.providerId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to update this skill." }, { status: 403 });
    }

    Object.assign(skill, parsed.data);
    await skill.save();

    return NextResponse.json({ data: skill.toJSON() });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[PUT /api/skills/[id]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/**
 * DELETE /api/skills/[id] — Delete skill (only owner).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    const { id } = await params;
    const badId = isValidObjectId(id);
    if (badId) return badId;

    await connectToDatabase();

    const skill = await Skill.findById(id);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found." }, { status: 404 });
    }

    if (skill.providerId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to delete this skill." }, { status: 403 });
    }

    await Skill.findByIdAndDelete(id);

    return NextResponse.json({ data: { message: "Skill deleted." } });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[DELETE /api/skills/[id]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
