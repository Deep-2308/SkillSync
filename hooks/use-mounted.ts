"use client";

import { useEffect, useState } from "react";

/**
 * Returns `true` only after the component has mounted on the client.
 * Use to avoid hydration mismatches when rendering something that differs
 * between server and client (e.g. the current theme before next-themes resolves).
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
