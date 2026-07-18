"use client";

import { useEffect, useState } from "react";

/**
 * Subscribe to a CSS media query and re-render when it changes.
 * Example: `const isDesktop = useMediaQuery("(min-width: 768px)")`.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    // Sync initial value (handles the case where it already matches on mount).
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
