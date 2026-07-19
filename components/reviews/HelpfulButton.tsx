"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HelpfulButtonProps {
  reviewId: string;
  initialHelpfulCount: number;
  initialHelpfulState?: boolean;
}

export function HelpfulButton({ reviewId, initialHelpfulCount, initialHelpfulState = false }: HelpfulButtonProps) {
  const [isHelpful, setIsHelpful] = useState(initialHelpfulState);
  const [count, setCount] = useState(initialHelpfulCount);
  const [isLoading, setIsLoading] = useState(false);

  const toggleHelpful = async () => {
    if (isLoading) return;
    
    // Optimistic update
    const previousState = isHelpful;
    const previousCount = count;
    
    setIsHelpful(!previousState);
    setCount(previousCount + (previousState ? -1 : 1));
    setIsLoading(true);

    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
      });
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit vote");
      }
      
      // Sync with server state
      if (json.data) {
        setIsHelpful(json.data.helpful);
        setCount(json.data.helpfulCount);
      }
    } catch (error) {
      // Revert on failure
      setIsHelpful(previousState);
      setCount(previousCount);
      toast.error(error instanceof Error ? error.message : "Failed to vote");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleHelpful}
      disabled={isLoading}
      className={cn(
        "h-8 px-2 text-xs",
        isHelpful ? "text-brand hover:text-brand bg-brand/10 hover:bg-brand/20" : "text-muted-foreground"
      )}
    >
      <ThumbsUp className={cn("w-3 h-3 mr-1.5", isHelpful && "fill-current")} />
      Helpful ({count})
    </Button>
  );
}
