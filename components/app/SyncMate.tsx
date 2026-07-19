"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Sparkles, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SyncMateProps {
  role: string;
  firstName?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function SyncMate({ role, firstName }: SyncMateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi ${firstName || "there"}! I'm SyncMate. How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const clientChips = [
    { label: "How do I hire?", action: "How do I hire a freelancer?", link: undefined },
    { label: "Analyze my latest proposals", link: "/projects", action: undefined },
  ];

  const freelancerChips = [
    { label: "Find projects for me", link: "/search", action: undefined },
    { label: "Improve my profile", link: "/settings/profile", action: undefined },
  ];

  const chips = role === "client" ? clientChips : freelancerChips;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    try {
      // Keep only last 10 messages to avoid context window limits
      const contextMessages = newMessages.slice(-10);

      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: contextMessages }),
      });

      if (!res.ok) {
        throw new Error("Failed to communicate with SyncMate.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader available.");

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunkText = decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            if (updated.length > 0) {
              const last = updated[updated.length - 1];
              if (last) last.content += chunkText;
            }
            return updated;
          });
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now." },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-background border rounded-2xl shadow-xl w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 origin-bottom-right">
          {/* Header */}
          <div className="bg-brand/5 border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-brand" />
              </div>
              <div>
                <h3 className="font-bold text-sm">SyncMate</h3>
                <p className="text-xs text-muted-foreground">Platform Assistant</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto outline-none" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                      msg.role === "user"
                        ? "bg-brand text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isStreaming && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Suggestions */}
          {messages.length === 1 && !isStreaming && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {chips.map((chip, idx) => (
                chip.link ? (
                  <Link key={idx} href={chip.link} onClick={() => setIsOpen(false)} className="text-xs bg-brand/10 text-brand hover:bg-brand/20 px-3 py-1.5 rounded-full transition-colors border border-brand/20">
                    {chip.label}
                  </Link>
                ) : (
                  <button key={idx} onClick={() => handleSubmit(chip.action!)} className="text-xs bg-muted text-foreground hover:bg-muted/80 px-3 py-1.5 rounded-full transition-colors border text-left">
                    {chip.label}
                  </button>
                )
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t bg-background">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(input);
              }}
              className="relative flex items-center"
            >
              <Input
                placeholder="Ask about your dashboard..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isStreaming}
                className="pr-10 rounded-full"
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                disabled={!input.trim() || isStreaming}
                className="absolute right-1 w-8 h-8 rounded-full"
              >
                <Send className="w-4 h-4 text-brand" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-brand text-primary-foreground p-0 flex items-center justify-center hover:-translate-y-1"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}
