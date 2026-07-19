"use client";

import { useState, useEffect, useRef } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Send, UserCircle, Paperclip, MoreVertical, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function MessagesClient({ currentUserId }: { currentUserId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialThreadId = searchParams.get("id");

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(initialThreadId);
  const [messages, setMessages] = useState<any[]>([]);
  
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/messages");
      const json = await res.json();
      if (res.ok && json.data) {
        setConversations(json.data);
      }
    } catch (err) {
      // silent fail for polling
    }
  };

  const fetchMessages = async (threadId: string) => {
    try {
      const res = await fetch(`/api/messages/${threadId}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setMessages(json.data);
        // If we fetched successfully, mark as read
        fetch(`/api/messages/${threadId}/read`, { method: "POST" });
        
        // Update local unread count for this thread
        setConversations((prev) => 
          prev.map(c => {
            if (c._id === threadId) {
              const newUnreadCounts = c.unreadCounts.map((uc: any) => 
                uc.userId === currentUserId ? { ...uc, count: 0 } : uc
              );
              return { ...c, unreadCounts: newUnreadCounts };
            }
            return c;
          })
        );
      }
    } catch (err) {
      // silent fail
    }
  };

  useEffect(() => {
    fetchConversations();
    
    // Poll conversations every 15s
    const convInterval = setInterval(fetchConversations, 15000);
    return () => clearInterval(convInterval);
  }, []);

  useEffect(() => {
    if (activeThreadId) {
      fetchMessages(activeThreadId);
      // Poll active thread every 3s
      const msgInterval = setInterval(() => fetchMessages(activeThreadId), 3000);
      return () => clearInterval(msgInterval);
    }
  }, [activeThreadId]);

  // Scroll to bottom when messages load
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeThreadId || isSending) return;
    
    setIsSending(true);
    const body = newMessage;
    setNewMessage(""); // optimistic clear

    try {
      const res = await fetch(`/api/messages/${activeThreadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      
      if (res.ok) {
        // Fetch immediately to show the sent message
        fetchMessages(activeThreadId);
        fetchConversations();
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed to send message");
        setNewMessage(body); // restore
      }
    } catch (err) {
      toast.error("Failed to send message");
      setNewMessage(body);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeConversation = conversations.find(c => c._id === activeThreadId);
  const otherParticipant = activeConversation?.participants?.find((p: any) => p._id !== currentUserId);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d)) return format(d, "h:mm a");
    if (isYesterday(d)) return "Yesterday";
    return format(d, "MMM d");
  };

  return (
    <div className="bg-card rounded-2xl border shadow-sm flex h-[calc(100vh-12rem)] min-h-[500px] overflow-hidden">
      
      {/* Left Pane: Conversation List */}
      <div className={cn(
        "w-full md:w-80 lg:w-96 border-r flex flex-col bg-muted/10",
        activeThreadId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b bg-card">
          <h2 className="font-bold text-lg">Inbox</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No conversations yet.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {conversations.map((conv) => {
                const other = conv.participants?.find((p: any) => p._id !== currentUserId);
                const unreadEntry = conv.unreadCounts?.find((uc: any) => uc.userId === currentUserId);
                const unreadCount = unreadEntry?.count || 0;
                
                return (
                  <button
                    key={conv._id}
                    onClick={() => {
                      setActiveThreadId(conv._id);
                      router.push(`/messages?id=${conv._id}`, { scroll: false });
                    }}
                    className={cn(
                      "w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-start gap-3 relative",
                      activeThreadId === conv._id && "bg-brand/5 border-l-2 border-l-brand"
                    )}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={other?.image} />
                      <AvatarFallback><UserCircle className="w-8 h-8" /></AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className={cn("font-medium truncate pr-2", unreadCount > 0 && "font-bold text-foreground")}>
                          {other?.name || "Unknown"}
                        </span>
                        {conv.lastMessageAt && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatTime(conv.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center gap-2">
                        <p className={cn(
                          "text-sm truncate",
                          unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                        )}>
                          {conv.lastMessage?.body || (conv.projectId ? `Re: ${conv.projectId.title}` : "New conversation")}
                        </p>
                        {unreadCount > 0 && (
                          <span className="shrink-0 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-primary-foreground">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Active Thread */}
      <div className={cn(
        "flex-1 flex flex-col bg-card",
        !activeThreadId ? "hidden md:flex" : "flex"
      )}>
        {!activeThreadId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquareIcon className="w-16 h-16 opacity-20 mb-4" />
            <p>Select a conversation to start messaging</p>
          </div>
        ) : !activeConversation ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="animate-pulse">Loading conversation...</div>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b flex items-center justify-between bg-card shrink-0">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden -ml-2"
                  onClick={() => {
                    setActiveThreadId(null);
                    router.push("/messages", { scroll: false });
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
                
                <Avatar className="w-10 h-10">
                  <AvatarImage src={otherParticipant?.image} />
                  <AvatarFallback><UserCircle className="w-6 h-6" /></AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold">{otherParticipant?.name || "Unknown"}</h3>
                  {activeConversation.projectId && (
                    <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-md">
                      Project: {activeConversation.projectId.title}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-muted/5">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Send a message to start the conversation.
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMine = msg.senderId?._id === currentUserId || msg.senderId === currentUserId;
                  const showDaySeparator = index === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();
                  
                  return (
                    <div key={msg._id || index} className="space-y-4">
                      {showDaySeparator && (
                        <div className="flex items-center justify-center">
                          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            {format(new Date(msg.createdAt), "MMMM d, yyyy")}
                          </span>
                        </div>
                      )}
                      
                      <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                          isMine 
                            ? "bg-brand text-primary-foreground rounded-tr-sm" 
                            : "bg-card border shadow-sm rounded-tl-sm"
                        )}>
                          <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                          <div className={cn(
                            "text-[10px] mt-1 text-right opacity-70",
                            isMine ? "text-primary-foreground" : "text-muted-foreground"
                          )}>
                            {format(new Date(msg.createdAt), "h:mm a")}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer Area */}
            <div className="p-4 bg-card border-t shrink-0">
              <div className="flex items-end gap-2">
                <Button variant="outline" size="icon" className="shrink-0 h-10 w-10 rounded-full" disabled>
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                </Button>
                <div className="flex-1 relative">
                  <Textarea 
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-h-[40px] h-10 max-h-32 resize-none py-2.5 rounded-2xl pr-12 scrollbar-hide bg-muted/30 border-muted"
                    rows={1}
                  />
                  <Button 
                    size="icon"
                    className="absolute right-1 bottom-1 h-8 w-8 rounded-full"
                    onClick={handleSend}
                    disabled={!newMessage.trim() || isSending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Press Enter to send, Shift + Enter for new line.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MessageSquareIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
