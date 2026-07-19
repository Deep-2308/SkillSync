import { DefaultSession } from "next-auth";

/**
 * NextAuth type augmentations.
 *
 * Extends the default NextAuth session, user, and JWT types so that
 * `session.user.id` and `session.user.role` are strongly typed everywhere.
 * These declarations merge with the module declarations in next-auth itself.
 *
 * @see https://next-auth.js.org/getting-started/typescript
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "client" | "freelancer" | "admin";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "client" | "freelancer" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "client" | "freelancer" | "admin";
  }
}
