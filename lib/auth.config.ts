import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Edge-safe base auth config.
 *
 * This file must NOT import Mongoose, bcrypt, or the Credentials provider —
 * it is loaded by middleware.ts, which runs on the Edge runtime where those
 * Node-only modules can't execute. The full config in lib/auth.ts spreads this
 * and adds the Node-only Credentials provider + database callbacks.
 *
 * @see https://authjs.dev/guides/edge-compatibility
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    // Google is edge-compatible (pure OAuth, no native deps), so it can live
    // in the shared config. Credentials is added only in lib/auth.ts.
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    // Persist id/role onto the token at sign-in; they then flow into the session.
    // Edge-safe: pure object mutation, no DB access.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user.role ?? "member") as "member" | "provider" | "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
