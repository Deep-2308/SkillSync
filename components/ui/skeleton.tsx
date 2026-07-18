import { cn } from "@/lib/utils";

/**
 * shadcn/ui Skeleton (new-york). A pulsing placeholder block for loading states.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
