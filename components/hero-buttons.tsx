"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function HeroButtons() {
  const [showDemo, setShowDemo] = useState(false)

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Link href="/signup">
        <Button size="lg" className="btn-glow text-base px-8 h-12 w-full sm:w-auto tracking-wide">
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
      <Button
        variant="outline"
        size="lg"
        className="text-base px-8 h-12 w-full sm:w-auto tracking-wide border-border hover:border-primary/40 hover:bg-primary/5 bg-transparent"
        onClick={() => setShowDemo(true)}
      >
        <Play className="mr-2 h-4 w-4 fill-current" />
        Watch Demo
      </Button>

      {showDemo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-lg p-8 max-w-lg w-full shadow-2xl shadow-black/50">
            <h2 className="text-xl font-bold mb-4 text-foreground">SkillSync Demo</h2>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-6 border border-border">
              <p className="text-muted-foreground font-serif text-sm italic">Demo coming soon</p>
            </div>
            <Button onClick={() => setShowDemo(false)} variant="outline" className="w-full hover:border-primary/40">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
