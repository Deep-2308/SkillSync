"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MessageButtonProps {
  participantId: string;
  projectId?: string;
  contractId?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export function MessageButton({
  participantId,
  projectId,
  contractId,
  className,
  variant = "default",
  size = "default",
  children,
}: MessageButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleMessageClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, projectId, contractId }),
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        toast.error(json.error || "Failed to start conversation");
        return;
      }
      
      router.push(`/messages?id=${json.data.conversationId}`);
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
      onClick={handleMessageClick}
      disabled={isLoading}
    >
      <MessageSquare className="w-4 h-4" />
      {children || (isLoading ? "Opening..." : "Message")}
    </Button>
  );
}
