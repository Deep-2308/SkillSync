import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  rating: number;
  count?: number;
  showCount?: boolean;
  className?: string;
}

export function RatingDisplay({ rating = 0, count = 0, showCount = true, className }: RatingDisplayProps) {
  // Gracefully handle undefined or null ratings
  const safeRating = typeof rating === "number" ? rating : 0;
  
  return (
    <div className={cn("flex items-center gap-1.5 text-sm", className)}>
      <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
      <span className="font-medium text-foreground">{safeRating.toFixed(1)}</span>
      {showCount && (
        <span className="text-muted-foreground whitespace-nowrap">
          ({count} review{count !== 1 && "s"})
        </span>
      )}
    </div>
  );
}
