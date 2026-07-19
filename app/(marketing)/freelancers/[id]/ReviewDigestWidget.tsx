"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, ThumbsUp, ArrowUpRight } from "lucide-react";
import { useAIStatus } from "@/hooks/use-ai-status";

interface ReviewDigestWidgetProps {
  userId: string;
  totalReviews: number;
}

export function ReviewDigestWidget({ userId, totalReviews }: ReviewDigestWidgetProps) {
  const aiStatus = useAIStatus();
  const [digest, setDigest] = useState<{ strengths: string[]; improvements: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only try to fetch if we have enough reviews and AI is potentially available.
    // If AI is actually unavailable, the backend will return a 503 error which we catch gracefully.
    if (totalReviews < 3) {
      setIsLoading(false);
      return;
    }

    const fetchDigest = async () => {
      try {
        const res = await fetch("/api/ai/analyze/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        
        if (res.ok) {
          const json = await res.json();
          setDigest(json.data);
        }
      } catch (err) {
        // Fail silently - it's a progressive enhancement
        console.error("Failed to load review digest:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDigest();
  }, [userId, totalReviews]);

  if (totalReviews < 3) return null;
  if (!aiStatus.enabled && !digest) return null; // Hide entirely if AI is disabled and we don't already have it cached
  if (isLoading) {
    return (
      <div className="bg-brand/5 border border-brand/20 rounded-2xl p-6 mb-8 flex items-center justify-center min-h-[120px]">
        <Loader2 className="w-5 h-5 text-brand animate-spin" />
      </div>
    );
  }
  if (!digest) return null;

  return (
    <div className="bg-brand/5 border border-brand/20 rounded-2xl p-6 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Sparkles className="w-24 h-24 text-brand" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-brand" />
          <h3 className="text-lg font-bold text-foreground">What clients say</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          An AI-generated summary based on {totalReviews} reviews.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {digest.strengths && digest.strengths.length > 0 && (
            <div className="bg-background/80 rounded-xl p-4 border border-border/50">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" /> Strengths
              </h4>
              <ul className="space-y-2">
                {digest.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {digest.improvements && digest.improvements.length > 0 && (
            <div className="bg-background/80 rounded-xl p-4 border border-border/50">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" /> Areas for Improvement
              </h4>
              <ul className="space-y-2">
                {digest.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
