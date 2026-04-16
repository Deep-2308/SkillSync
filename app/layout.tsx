import type React from "react"
import type { Metadata } from "next"
import { Syne, Newsreader, DM_Mono, Unbounded } from "next/font/google"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
})

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
})

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
})

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
})

export const metadata: Metadata = {
  title: "SkillSync — Smart Freelancer Hiring & Review Platform",
  description:
    "Hire Smarter. Work Better. Connect with top freelancers through AI-powered skill matching, secure payments, and verified reviews.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${newsreader.variable} ${dmMono.variable} ${unbounded.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
