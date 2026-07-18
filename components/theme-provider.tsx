"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";

/**
 * Theme system built on next-themes.
 *
 * - `attribute="class"` toggles the `.dark` class on <html>, which is what
 *   the `@custom-variant dark` rule in app/globals.css keys off.
 * - `defaultTheme="system"` + `enableSystem` respects the OS preference until
 *   the user explicitly picks a mode.
 * - `disableTransitionOnChange` prevents a flash of every CSS transition
 *   firing at once when the palette swaps.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

/** The three modes SkillSync supports. */
export type Theme = "light" | "dark" | "system";

export interface UseThemeReturn {
  /** The user's *choice* — may be "system". */
  theme: Theme;
  /** What is actually rendered right now — never "system". Undefined until mounted. */
  resolvedTheme: "light" | "dark" | undefined;
  setTheme: (theme: Theme) => void;
  /** Flip between light and dark (resolving "system" first). */
  toggleTheme: () => void;
}

/**
 * Typed wrapper around next-themes' useTheme.
 *
 * next-themes types `theme` as `string | undefined`, which invites typos like
 * setTheme("drak"). This narrows everything to the `Theme` union and adds a
 * convenience `toggleTheme`.
 */
export function useTheme(): UseThemeReturn {
  const { theme, resolvedTheme, setTheme } = useNextTheme();

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return {
    theme: (theme ?? "system") as Theme,
    resolvedTheme: resolvedTheme as "light" | "dark" | undefined,
    setTheme,
    toggleTheme,
  };
}
