import { NextResponse } from "next/server";
import type { Session } from "next-auth";

import { getAuthSession } from "@/lib/api-utils";

/**
 * Require an authenticated admin. Throws a 401/403 NextResponse otherwise
 * (caught by the route's try/catch like getAuthSession's).
 */
export async function getAdminSession(): Promise<Session> {
  const session = await getAuthSession();
  if (session.user.role !== "admin") {
    throw NextResponse.json(
      { error: "Admin access required." },
      { status: 403 }
    );
  }
  return session;
}
