import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <h2 className="text-9xl font-extrabold tracking-tighter text-muted/20">404</h2>
      <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">Page not found</h1>
      <p className="mt-4 text-muted-foreground mb-8 max-w-md">
        Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
      </p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
