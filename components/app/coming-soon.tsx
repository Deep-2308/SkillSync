import { Clock } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground mb-6">
        <Clock className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-md mx-auto">
        {description || "This feature is currently under development and will be available soon."}
      </p>
    </div>
  );
}
