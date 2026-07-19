"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import type { UserRole } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Client-side route guard.
 *
 * - loading      → full-page skeleton
 * - unauthenticated → redirect to /login?callbackUrl=<current path>
 * - authenticated but wrong role → redirect to /unauthorized
 * - authenticated (and role ok) → render children
 *
 * This complements (does not replace) the server middleware in middleware.ts:
 * middleware blocks the request early, this guards client transitions and
 * gives a graceful loading state. Never rely on client checks alone for
 * security — always enforce on the server too.
 *
 * Role note: `requiredRole` is typed against the canonical UserRole union
 * ("client" | "freelancer" | "admin" — see types/index.ts) so it can't drift
 * from the auth layer.
 */
export function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: UserRole;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const role = session?.user?.role;
  const isAuthed = status === "authenticated";
  const roleOk = !requiredRole || role === requiredRole;

  React.useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      const callbackUrl = encodeURIComponent(pathname);
      router.replace(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    if (isAuthed && !roleOk) {
      router.replace("/unauthorized");
    }
  }, [status, isAuthed, roleOk, pathname, router]);

  // While resolving — or during the redirect tick — show the skeleton so we
  // never flash protected content.
  if (status === "loading" || !isAuthed || !roleOk) {
    return <FullPageSkeleton />;
  }

  return <>{children}</>;
}

/** Full-page loading placeholder shown while auth resolves. */
function FullPageSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-3 h-5 w-72" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    </div>
  );
}
