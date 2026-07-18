"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

/**
 * Animated light/dark toggle.
 *
 * Both icons are always in the DOM, stacked on top of each other; the active
 * one rotates/scales in while the other rotates out. Because the *server*
 * doesn't know the theme, we render both icons identically until mount and
 * let CSS (keyed off the .dark class) decide visibility — this avoids both
 * hydration mismatches and the "wrong icon flash".
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn("relative overflow-hidden", className)}
      // Static label — the visible icon already communicates current state,
      // and a stable name is friendlier to screen readers than a changing one.
      aria-label="Toggle theme"
    >
      {/* Sun: visible in light mode, spins away in dark mode. */}
      <Sun
        className={cn(
          "size-4.5 transition-all duration-500 ease-out",
          "rotate-0 scale-100",
          "dark:-rotate-90 dark:scale-0"
        )}
      />
      {/* Moon: absolutely stacked over the sun, fades/rotates in for dark. */}
      <Moon
        className={cn(
          "absolute size-4.5 transition-all duration-500 ease-out",
          "rotate-90 scale-0",
          "dark:rotate-0 dark:scale-100"
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
