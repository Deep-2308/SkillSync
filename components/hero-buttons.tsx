"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function HeroButtons() {
  const [showDemo, setShowDemo] = useState(false)

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link href="/signup">
        <Button size="lg" className="text-lg px-8 w-full sm:w-auto">
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
      <Button
        variant="outline"
        size="lg"
        className="text-lg px-8 bg-transparent w-full sm:w-auto"
        onClick={() => setShowDemo(true)}
      >
        {showDemo ? "Demo Loading..." : "Watch Demo"}
      </Button>

      {showDemo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">SkillSync Demo</h2>
            <div className="aspect-video bg-muted rounded flex items-center justify-center mb-4">
              <p className="text-muted-foreground">Video Demo Placeholder</p>
            </div>
            <Button onClick={() => setShowDemo(false)} className="w-full">
              Close Demo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
