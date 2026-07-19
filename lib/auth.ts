import NextAuth, { type DefaultSession } from "next-auth";
// Importing the JWT type also makes the `next-auth/jwt` module resolvable to the
// `declare module` augmentation below (required under moduleResolution: bundler).
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { authConfig } from "@/lib/auth.config";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { signInSchema } from "@/types/schemas";

/**
 * Central NextAuth (Auth.js v5) configuration.
 *
 * This is the FULL (Node runtime) config: it spreads the edge-safe base from
 * lib/auth.config.ts and layers on the Credentials provider, which depends on
 * Mongoose + bcrypt and therefore can't run on the Edge. Middleware imports the
 * base config instead. JWT session strategy keeps auth stateless (and is
 * required by the Credentials provider); the Mongoose `User` model is the
 * source of truth for accounts.
 */
export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    // Spread the edge-safe providers (Google) and add the Node-only one.
    ...authConfig.providers,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        // Validate shape/format before touching the database.
        const parsed = signInSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        await connectToDatabase();

        // `passwordHash` is `select: false` in the schema, so we must ask for it explicitly.
        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user?.passwordHash) return null;
        if (user.banned) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        // The returned object becomes the JWT payload seed (see jwt callback).
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image ?? null,
          role: (user.role ?? undefined) as "client" | "freelancer" | "admin" | undefined,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    /**
     * signIn callback — runs AFTER the provider verifies the user but BEFORE
     * a JWT is minted. This is where we upsert Google OAuth users into our
     * MongoDB User collection so they have a role and are queryable.
     */
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          if (!user.email || !user.name) return false;

          await connectToDatabase();

          const existingUser = await User.findOne({ email: user.email });

          if (existingUser) {
            if (existingUser.banned) return false;
            
            // Existing user — populate the user object with DB fields so the
            // jwt callback can persist id/role onto the token.
            user.id = existingUser._id.toString();
            user.role = (existingUser.role ?? undefined) as "client" | "freelancer" | "admin" | undefined;
            user.name = existingUser.name;
            user.image = existingUser.image ?? user.image ?? null;
            user.banned = existingUser.banned;

            // Mark email as verified if not already (Google-verified email).
            if (!existingUser.emailVerified) {
              existingUser.emailVerified = new Date();
              await existingUser.save();
            }
          } else {
            // First-time Google user — create a new User document.
            const newUser = await User.create({
              name: user.name,
              email: user.email,
              image: user.image ?? null,
              emailVerified: new Date(),
            });

            user.id = newUser._id.toString();
            user.role = (newUser.role ?? undefined) as "client" | "freelancer" | "admin" | undefined;
            user.banned = newUser.banned;
          }
        } catch (error) {
          console.error("[auth] Google signIn callback error:", error);
          return false; // Block sign-in on DB error.
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile, trigger, session }) {
      // First, let the edge-safe base config do its work.
      let newToken = await authConfig.callbacks?.jwt?.({ token, user, account, profile, trigger, session }) ?? token;

      // Stale JWT fix: Refresh role and ban status from DB every 15 minutes.
      const now = Math.floor(Date.now() / 1000);
      const REFRESH_INTERVAL = 15 * 60; // 15 minutes

      if (!newToken.lastCheckAt || now - (newToken.lastCheckAt as number) > REFRESH_INTERVAL) {
        try {
          await connectToDatabase();
          const dbUser = await User.findById(newToken.id).select("role banned").lean();
          if (dbUser) {
            newToken.role = (dbUser.role ?? undefined) as "client" | "freelancer" | "admin" | undefined;
            newToken.banned = dbUser.banned ?? false;
          } else {
            newToken.banned = true;
          }
          newToken.lastCheckAt = now;
        } catch (error) {
          console.error("[auth] JWT refresh error:", error);
          // On DB error, don't update lastCheckAt so it retries next time.
        }
      }

      return newToken;
    },
  },
});

// Convenience re-exports so the route handler can do `export { GET, POST }`.
export const { GET, POST } = handlers;
