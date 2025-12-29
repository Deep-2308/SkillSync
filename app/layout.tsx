import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { AuthProvider } from "@/context/AuthContext"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "SkillSync - Smart Freelancer Hiring & Review Platform",
  description:
    "Hire Smarter. Work Better. Connect with top freelancers through AI-powered skill matching, secure payments, and verified reviews.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Remove v0 watermark on page load
                function removeV0Watermark() {
                  // Remove elements with v0 links
                  const v0Links = document.querySelectorAll('a[href*="v0.dev"], a[href*="v0.app"]');
                  v0Links.forEach(link => {
                    const parent = link.closest('div');
                    if (parent && (parent.style.position === 'fixed' || parent.style.position === 'fixed')) {
                      parent.remove();
                    }
                    link.remove();
                  });
                  
                  // Remove elements with data attributes
                  const watermarks = document.querySelectorAll('[data-v0-watermark], [data-v0-badge]');
                  watermarks.forEach(el => el.remove());
                  
                  // Remove fixed positioned elements in bottom-left that might be watermarks
                  const fixedElements = document.querySelectorAll('div[style*="position: fixed"], div[style*="position:fixed"]');
                  fixedElements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    if (style.position === 'fixed' && 
                        (style.bottom === '0px' || style.bottom === '0' || parseInt(style.bottom) < 50) &&
                        (style.left === '0px' || style.left === '0' || parseInt(style.left) < 50) &&
                        el.querySelector('a[href*="v0"]')) {
                      el.remove();
                    }
                  });
                }
                
                // Run immediately
                removeV0Watermark();
                
                // Run after DOM is fully loaded
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', removeV0Watermark);
                }
                
                // Run after page is fully loaded
                window.addEventListener('load', removeV0Watermark);
                
                // Use MutationObserver to catch dynamically added watermarks
                const observer = new MutationObserver(removeV0Watermark);
                observer.observe(document.body, {
                  childList: true,
                  subtree: true
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
