import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { Skill } from "@/models/Skill";

/**
 * GET /api/skills/mine — Current user's skill listings (auth required).
 */
export async function GET() {
  try {
    const session = await getAuthSession();
    await connectToDatabase();

    const skills = await Skill.find({ providerId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const data = skills.map((s) => ({
      ...s,
      id: s._id?.toString(),
      _id: undefined,
      __v: undefined,
    }));

    return NextResponse.json({ data: { skills: data } });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/skills/mine]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
