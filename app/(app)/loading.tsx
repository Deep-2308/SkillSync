import { Loader2 } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}
