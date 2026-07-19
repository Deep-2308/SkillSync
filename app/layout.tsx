import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import { auth } from "@/lib/auth";
import { Providers } from "@/components/providers";

import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/CookieConsent";
import "@/app/globals.css";

/**
 * Geist Sans for UI text, Geist Mono for code/tabular content.
 * Exposed as CSS variables consumed by --font-sans / --font-mono in globals.css.
 */
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "SkillSync — Smart Freelancer Hiring & Review System",
    template: "%s · SkillSync",
  },
  description:
    "SkillSync is an AI-powered freelancing platform to hire vetted talent, manage projects and contracts, and pay securely.",
  keywords: ["freelance", "hiring", "freelancer marketplace", "talent", "AI matching"],
  authors: [{ name: "SkillSync" }],
  openGraph: {
    title: "SkillSync",
    description: "Hire smarter. Work smarter.",
    type: "website",
    siteName: "SkillSync",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillSync",
    description: "Hire smarter. Work smarter.",
  },
};

export const viewport: Viewport = {
  // Matches --background in each mode so the browser chrome blends in.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" }, // slate-900
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Resolve the session server-side so AuthProvider hydrates with it —
  // no client-side /api/auth/session round-trip on first paint.
  const session = await auth();

  return (
    // suppressHydrationWarning: next-themes sets the class/style on <html>
    // before hydration, which React would otherwise flag as a mismatch.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers session={session}>
          {/* Skip-to-main-content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground"
          >
            Skip to main content
          </a>
          
          {children}
          {/* Sonner toaster at the root; matches active theme automatically. */}
          <Toaster richColors position="top-right" closeButton />
          <CookieConsent />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
