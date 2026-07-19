"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CONSENT_KEY = "skillsync-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on first visit — check localStorage
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 transition-all duration-500 animate-in slide-in-from-bottom-full",
      )}
    >
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl border bg-card shadow-xl">
          <Cookie className="w-8 h-8 text-amber-500 flex-shrink-0 hidden sm:block" />
          <div className="flex-1">
            <p className="text-sm text-foreground/80">
              We use cookies to enhance your experience. By continuing to browse, you agree to our{" "}
              <Link href="/privacy#cookies" className="text-brand underline underline-offset-2 hover:no-underline">
                Cookie Policy
              </Link>.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={decline} className="flex-1 sm:flex-none">
              Decline
            </Button>
            <Button size="sm" onClick={accept} className="flex-1 sm:flex-none">
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
