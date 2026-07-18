"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type Animation = "fadeIn" | "slideUp" | "slideInLeft" | "slideInRight";

/** Maps each animation name to its utility class (defined in app/globals.css). */
const animationClass: Record<Animation, string> = {
  fadeIn: "animate-fade-in",
  slideUp: "animate-slide-up",
  slideInLeft: "animate-slide-in-left",
  slideInRight: "animate-slide-in-right",
};

export interface AnimatedSectionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: Animation;
  /** Delay before the animation starts once in view, in milliseconds. */
  delay?: number;
  /** Fraction of the element that must be visible to trigger (0–1). */
  threshold?: number;
  /** Play only the first time it enters the viewport (default) vs. every time. */
  once?: boolean;
}

/**
 * Reveals its children with a CSS animation when scrolled into view.
 *
 * SSR-safe: the element renders with `opacity: 0` markup on the server and
 * stays invisible until the IntersectionObserver (client-only) fires, at which
 * point the animation class is applied. If IntersectionObserver is unavailable
 * (very old browsers / no JS), we fail open by showing content immediately.
 */
export function AnimatedSection({
  children,
  animation = "fadeIn",
  delay = 0,
  threshold = 0.15,
  once = true,
  className,
  style,
  ...props
}: AnimatedSectionProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Fail open where IntersectionObserver isn't supported.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once]);

  return (
    <div
      ref={ref}
      // Hidden until visible; the animation class handles the reveal + final state.
      className={cn(visible ? animationClass[animation] : "opacity-0", className)}
      style={{
        ...style,
        animationDelay: visible && delay ? `${delay}ms` : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
