"use client";

import * as React from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import type { Session } from "next-auth";

/**
 * AuthProvider — the app's single authentication boundary.
 *
 * Wraps NextAuth's SessionProvider and layers a small, app-specific context on
 * top so components consume `useAuth()` instead of importing next-auth
 * directly everywhere. If the auth backend ever changes, only this file does.
 */

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "client" | "freelancer" | "admin";
}

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  /** True while the session is still being resolved on the client. */
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

/** Maps the NextAuth session onto our narrower AuthContext shape. */
function AuthContextBridge({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const value = React.useMemo<AuthContextValue>(() => {
    const sessionUser = session?.user;
    const user: AuthUser | null = sessionUser
      ? {
          id: sessionUser.id,
          name: sessionUser.name ?? "",
          email: sessionUser.email ?? "",
          image: sessionUser.image ?? null,
          role: sessionUser.role,
        }
      : null;

    return {
      user,
      status,
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading",
      signOut: async () => {
        await signOut({ callbackUrl: "/" });
      },
    };
  }, [session, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  /** Server-fetched session passed from app/layout.tsx to avoid a client fetch. */
  session?: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <AuthContextBridge>{children}</AuthContextBridge>
    </SessionProvider>
  );
}

/** Access the current auth state. Throws if used outside <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>.");
  }
  return context;
}
