import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

/* ── Font Loading ──────────────────────── */

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

/* ── SEO Metadata ──────────────────────── */

export const metadata: Metadata = {
  title: {
    default: "SkillSync — Smart Freelancer Hiring & Review Platform",
    template: "%s | SkillSync",
  },
  description:
    "Hire Smarter. Work Better. Connect with top freelancers through AI-powered skill matching, secure payments, and verified reviews.",
  keywords: [
    "freelancer",
    "hiring",
    "skill matching",
    "SkillSync",
    "remote work",
    "talent platform",
  ],
  authors: [{ name: "SkillSync" }],
  openGraph: {
    type: "website",
    title: "SkillSync — Smart Freelancer Hiring & Review Platform",
    description:
      "Connect with top freelancers through AI-powered skill matching, secure payments, and verified reviews.",
    siteName: "SkillSync",
  },
}

/* ── Root Layout ───────────────────────── */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="bottom-right"
              richColors
              closeButton
              duration={4000}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
