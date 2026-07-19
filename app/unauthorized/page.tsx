import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 mb-6">
        <Lock className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Access Denied</h1>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        You don't have permission to view this page. Please ensure you are logged in with the correct account type.
      </p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
