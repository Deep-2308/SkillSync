/**
 * NextAuth (Auth.js v5) catch-all route.
 *
 * All auth endpoints — /api/auth/signin, /callback/:provider, /session, etc. —
 * are served by the handlers exported from lib/auth.ts. This file is
 * intentionally tiny; all configuration lives in one place.
 */
export { GET, POST } from "@/lib/auth";
