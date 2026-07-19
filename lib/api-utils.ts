import { NextResponse } from "next/server";
import type { Session } from "next-auth";

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
