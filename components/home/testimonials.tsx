"use client";

import * as React from "react";
import Image from "next/image";
import { Quote, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { testimonials, type Testimonial } from "@/data/testimonials";
import { useMediaQuery } from "@/hooks/use-media-query";
import { AnimatedSection } from "@/components/animated-section";

const AUTOPLAY_MS = 5000;

/**
 * Testimonials carousel.
 *
 * Dependency-free: a horizontal flex track translated by `-index * 100%`.
 * - Desktop autoplays (paused on hover); mobile does not.
 * - Swipeable via pointer events on touch.
 * - Autoplay is skipped for users who prefer reduced motion.
 */
export function Testimonials() {
  const [index, setIndex] = React.useState(0);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)"
  );
  const [paused, setPaused] = React.useState(false);

  const count = testimonials.length;
  const goTo = React.useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );

  // Autoplay on desktop only, respecting reduced-motion and hover-pause.
  React.useEffect(() => {
    if (!isDesktop || prefersReducedMotion || paused) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % count),
      AUTOPLAY_MS
    );
    return () => window.clearInterval(id);
  }, [isDesktop, prefersReducedMotion, paused, count]);

  // --- Swipe handling (pointer events) ---
  const dragStartX = React.useRef<number | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    const threshold = 50; // px before we treat it as a swipe
    if (delta > threshold) goTo(index - 1);
    else if (delta < -threshold) goTo(index + 1);
    dragStartX.current = null;
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-24 sm:px-6">
      <AnimatedSection animation="slideUp" className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Loved by clients and freelancers
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Thousands of successful matches and counting.
        </p>
      </AnimatedSection>

      <AnimatedSection animation="fadeIn" delay={120} className="mt-14">
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          role="group"
          aria-roledescription="carousel"
          aria-label="Testimonials"
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {testimonials.map((t, i) => (
              <div
                key={t.id}
                className="w-full shrink-0 px-1"
                aria-hidden={i !== index}
              >
                <TestimonialCard testimonial={t} />
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              onClick={() => goTo(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index
                  ? "w-6 bg-brand"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              )}
            />
          ))}
        </div>
      </AnimatedSection>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { name, role, company, rating, quote, avatar } = testimonial;
  return (
    <figure className="mx-auto flex max-w-2xl flex-col items-center gap-6 rounded-2xl border bg-card p-8 text-center shadow-card sm:p-10">
      <Quote className="size-8 text-brand/40" aria-hidden />

      <blockquote className="text-balance text-lg font-medium sm:text-xl">
        “{quote}”
      </blockquote>

      {/* Star rating */}
      <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "size-4",
              i < rating
                ? "fill-brand-amber text-brand-amber"
                : "fill-muted text-muted"
            )}
          />
        ))}
      </div>

      <figcaption className="flex items-center gap-3">
        <span className="relative size-11 overflow-hidden rounded-full border">
          <Image
            src={avatar}
            alt={name}
            fill
            sizes="44px"
            className="object-cover"
          />
        </span>
        <span className="text-left">
          <span className="block font-semibold">{name}</span>
          <span className="block text-sm text-muted-foreground">
            {role} · {company}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
