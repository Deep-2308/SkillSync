"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

/**
 * Theme Toggle Button
 * Animated Moon/Sun icon button for switching between light and dark modes.
 * Uses the typed useTheme hook from theme-provider.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      id="theme-toggle-btn"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative h-9 w-9 rounded-lg hover:bg-secondary transition-colors duration-200"
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      {/* Sun icon — visible in dark mode, fades/rotates to Moon */}
      <Sun
        className="h-[1.15rem] w-[1.15rem] rotate-0 scale-100 transition-all duration-300 ease-out
                   dark:-rotate-90 dark:scale-0"
      />
      {/* Moon icon — visible in light mode, fades/rotates from Sun */}
      <Moon
        className="absolute h-[1.15rem] w-[1.15rem] rotate-90 scale-0 transition-all duration-300 ease-out
                   dark:rotate-0 dark:scale-100"
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
