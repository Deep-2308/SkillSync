"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"

/**
 * SkillSync ThemeProvider
 * Wraps children with next-themes for class-based dark mode switching.
 * defaultTheme="system" enables OS-level preference detection.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

/**
 * Typed useTheme hook wrapper.
 * Provides type-safe access to the current theme state.
 */
export function useTheme() {
  const context = useNextTheme()

  return {
    /** The currently active theme ("light" | "dark" | "system") */
    theme: context.theme,
    /** The resolved theme, accounting for system preference ("light" | "dark") */
    resolvedTheme: context.resolvedTheme,
    /** Set the theme to a specific value */
    setTheme: context.setTheme,
    /** The system preference ("light" | "dark") */
    systemTheme: context.systemTheme,
    /** List of available themes */
    themes: context.themes,
  }
}
