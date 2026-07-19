import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/auth.config";

/**
 * Route protection middleware (Edge runtime).
 *
 * Middleware runs on the Edge, where Mongoose/bcrypt can't execute — so we
 * build a dedicated NextAuth instance from the *edge-safe* base config
 * (lib/auth.config.ts) rather than importing the full `auth` from lib/auth.ts.
 * The JWT session is readable here without any DB access, which is all we need
 * to gate protected routes.
 */
const { auth } = NextAuth(authConfig);

/**
 * Routes that require authentication.
 * Any request matching these prefixes will redirect to /login with a callbackUrl.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/post-project",
  "/hire-talent",
  "/share-skill",
  "/settings",
  "/profile",
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = Boolean(req.auth);
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    nextUrl.pathname.startsWith(prefix)
  );
  
  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname === "/"; // Also redirect authenticated users from home

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  // Run on everything except static assets, images, and Next internals.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)" ],
};
