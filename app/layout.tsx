import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import { auth } from "@/lib/auth";
import { Providers } from "@/components/providers";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
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
    default: "SkillSync — Share skills. Hire talent.",
    template: "%s · SkillSync",
  },
  description:
    "SkillSync is an online marketplace to share your skills, learn from experts, and hire vetted talent by the hour.",
  keywords: ["skills", "hiring", "freelance", "mentorship", "learning"],
  authors: [{ name: "SkillSync" }],
  openGraph: {
    title: "SkillSync",
    description: "Share skills. Hire talent.",
    type: "website",
    siteName: "SkillSync",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillSync",
    description: "Share skills. Hire talent.",
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
          
          {/* App shell: sticky nav, page content, footer. min-h keeps the
              footer at the bottom on short pages. */}
          <div className="flex min-h-dvh flex-col">
            <Navigation />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
          </div>
          {/* Sonner toaster at the root; matches active theme automatically. */}
          <Toaster richColors position="top-right" closeButton />
          <CookieConsent />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
