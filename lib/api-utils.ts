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
 * Wrap a route handler to catch thrown NextResponse objects (from getAuthSession)
 * and unexpected errors. Returns the thrown Response directly if it's a NextResponse,
 * or a generic 500 for unexpected errors.
 */
export function withErrorHandler(
  handler: (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<NextResponse>
) {
  return async (req: Request, ctx: { params: Promise<Record<string, string>> }): Promise<NextResponse> => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (error instanceof NextResponse) return error;
      // NextResponse.json throws are NextResponse instances in Next.js,
      // but they may also be Response objects.
      if (error instanceof Response) {
        return error as NextResponse;
      }
      console.error("[api] Unexpected error:", error);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  };
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
 * Build a standard paginated JSON response.
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data: items,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}
