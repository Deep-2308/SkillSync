"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function HeroButtons() {
  const [showDemo, setShowDemo] = useState(false)

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Link href="/signup">
        <Button size="lg" className="btn-glow text-base px-8 h-13 w-full sm:w-auto tracking-wide bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
          Get Started
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </Link>
      <Button
        variant="outline"
        size="lg"
        className="text-base px-8 h-13 w-full sm:w-auto tracking-wide border-border hover:border-primary/40 hover:bg-primary/5 bg-transparent"
        onClick={() => setShowDemo(true)}
      >
        <Play className="mr-2 h-4 w-4 fill-current" />
        Watch Demo
      </Button>

      {showDemo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" style={{animationDuration: '0.2s'}}>
          <div className="bg-card border border-border rounded-2xl p-8 max-w-lg w-full shadow-2xl shadow-black/50 animate-slide-up" style={{animationDuration: '0.3s'}}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">SkillSync Demo</h2>
              <Button onClick={() => setShowDemo(false)} variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="aspect-video bg-muted rounded-xl flex items-center justify-center mb-6 border border-border bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="text-center">
                <Play className="h-12 w-12 text-primary/30 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">Demo coming soon</p>
              </div>
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
