import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * SkillSync wordmark with a blue→green gradient.
 * `bg-clip-text` + `text-transparent` paints the gradient onto the glyphs.
 * The gradient uses the brand color utilities defined in app/globals.css.
 */
export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "bg-gradient-to-r from-brand to-brand-green bg-clip-text text-xl font-bold tracking-tight text-transparent",
        className
      )}
      aria-label="SkillSync home"
    >
      SkillSync
    </Link>
  );
}
