import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { Types } from "mongoose";

import { auth } from "@/lib/auth";

/**
 * Get the authenticated session or throw a 401 NextResponse.
 *
 * Usage at the top of any protected route handler:
 *   const session = await getAuthSession();
 *   // If we reach here, session is guaranteed non-null.
 */
export async function getAuthSession(): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    throw NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }
  if (session.user.banned) {
    throw NextResponse.json(
      { error: "Account suspended." },
      { status: 403 }
    );
  }
  return session;
}

/**
 * Parse pagination query params with sensible defaults.
 */
export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10) || 12)
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Validate MongoDB ObjectId format.
 * Returns a 400 NextResponse if invalid, or null if valid.
 */
export function isValidObjectId(id: string): NextResponse | null {
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: "Invalid ID format." },
      { status: 400 }
    );
  }
  return null;
}
