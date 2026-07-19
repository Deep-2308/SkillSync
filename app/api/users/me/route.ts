import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/api-utils";
import { User } from "@/models/User";
import { updateUserEmbedding } from "@/lib/ai/matching";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  headline: z.string().max(120).optional(),
  bio: z.string().max(2000).optional(),
  image: z.string().url().optional().nullable(),
  location: z.string().max(120).optional(),
  skills: z.array(z.string()).max(30).optional(),
  categories: z.array(z.string()).max(30).optional(),
  hourlyRate: z.number().min(0).max(10000).optional(),
  notificationPreferences: z.object({
    proposals: z.boolean(),
    contracts: z.boolean(),
    payments: z.boolean(),
    reviews: z.boolean(),
  }).optional(),
});

/**
 * GET /api/users/me — Return current user's full profile.
 */
export async function GET() {
  try {
    const session = await getAuthSession();
    await connectToDatabase();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userData = user.toJSON();
    const hasPassword = Boolean(user.passwordHash);
    
    return NextResponse.json({ data: { ...userData, hasPassword } });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[GET /api/users/me]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/**
 * PUT /api/users/me — Update current user's profile.
 */
export async function PUT(request: Request) {
  try {
    const session = await getAuthSession();
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Fire and forget embedding generation for freelancers
    void updateUserEmbedding(user._id.toString());

    return NextResponse.json({ data: user.toJSON() });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[PUT /api/users/me]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
