"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedSectionProps {
  children: React.ReactNode
  delay?: number
  className?: string
  animation?: "fadeIn" | "slideUp" | "slideInLeft" | "slideInRight" | "blurIn" | "scaleIn"
}

export function AnimatedSection({
  children,
  delay = 0,
  className = "",
  animation = "fadeIn",
}: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
          observer.disconnect()
        }
      },
      { threshold: 0.08 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  const animationClasses = {
    fadeIn: isVisible
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-5",
    slideUp: isVisible
      ? "opacity-100 translate-y-0 blur-0"
      : "opacity-0 translate-y-10 blur-[2px]",
    slideInLeft: isVisible
      ? "opacity-100 translate-x-0"
      : "opacity-0 -translate-x-10",
    slideInRight: isVisible
      ? "opacity-100 translate-x-0"
      : "opacity-0 translate-x-10",
    blurIn: isVisible
      ? "opacity-100 blur-0 scale-100"
      : "opacity-0 blur-[6px] scale-[0.97]",
    scaleIn: isVisible
      ? "opacity-100 scale-100"
      : "opacity-0 scale-95",
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${animationClasses[animation]} ${className}`}
    >
      {children}
    </div>
  )
}
