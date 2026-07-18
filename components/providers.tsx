"use client";

import type { Session } from "next-auth";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";

/**
 * Single client boundary composing every app-wide provider, so the root
 * layout (a Server Component) crosses into client-land exactly once.
 *
 * Order matters: ThemeProvider is outermost so even auth-loading states
 * render in the correct color mode.
 */
export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <ThemeProvider>
      <AuthProvider session={session}>{children}</AuthProvider>
    </ThemeProvider>
  );
}
