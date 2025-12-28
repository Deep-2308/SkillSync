"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedSectionProps {
  children: React.ReactNode
  delay?: number
  className?: string
  animation?: "fadeIn" | "slideUp" | "slideInLeft" | "slideInRight"
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
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  const animationClasses = {
    fadeIn: isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
    slideUp: isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
    slideInLeft: isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8",
    slideInRight: isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8",
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${animationClasses[animation]} ${className}`}
    >
      {children}
    </div>
  )
}

