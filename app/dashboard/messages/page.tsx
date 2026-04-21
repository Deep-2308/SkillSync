"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatedSection } from "@/components/animated-section"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Send, MessageCircle, Loader2 } from "lucide-react"

interface Participant {
  _id: string
  name: string
  username?: string
  image?: string
}

interface ConversationItem {
  _id: string
  participants: Participant[]
  projectId: { _id: string; title: string }
  lastMessage: string
  lastMessageAt: string
}

interface MessageItem {
  _id: string
  senderId: { _id: string; name: string; image?: string }
  content: string
  createdAt: string
  read: boolean
}

export default function MessagesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [activeConvo, setActiveConvo] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/conversations")
        const data = await res.json()
        if (data.conversations) setConversations(data.conversations)
      } catch {
        // handled
      } finally {
        setLoading(false)
      }
    }
    fetchConversations()
  }, [])

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async () => {
    if (!activeConvo) return
    try {
      const res = await fetch(`/api/messages?conversationId=${activeConvo}`)
      const data = await res.json()
      if (data.messages) setMessages(data.messages)
    } catch {
      // handled
    }
  }, [activeConvo])

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (activeConvo) {
      fetchMessages()
      pollingRef.current = setInterval(fetchMessages, 3000)
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [activeConvo, fetchMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConvo) return

    setSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConvo, content: newMessage.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setNewMessage("")
      await fetchMessages()

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConvo
            ? { ...c, lastMessage: newMessage.trim(), lastMessageAt: new Date().toISOString() }
            : c
        )
      )
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const getOtherParticipant = (convo: ConversationItem) => {
    return convo.participants.find((p) => p._id !== user?.id) || convo.participants[0]
  }

  const activeConversation = conversations.find((c) => c._id === activeConvo)
  const otherUser = activeConversation ? getOtherParticipant(activeConversation) : null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnimatedSection animation="slideUp" delay={0}>
        <div>
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-2 block">Communication</span>
          <h1 className="font-display text-2xl font-bold tracking-tight">Messages</h1>
        </div>
      </AnimatedSection>

      {conversations.length === 0 ? (
        <AnimatedSection animation="fadeIn" delay={80}>
          <div className="text-center py-20 border border-dashed border-border rounded-lg">
            <MessageCircle className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
            <p className="font-serif text-muted-foreground italic">No messages yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Conversations are created when a proposal is accepted
            </p>
          </div>
        </AnimatedSection>
      ) : (
        <AnimatedSection animation="slideUp" delay={80}>
          <div className="border border-border rounded-lg overflow-hidden flex flex-col md:flex-row" style={{ height: "calc(100vh - 320px)", minHeight: "500px" }}>
            {/* Conversation List */}
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border bg-card overflow-y-auto shrink-0" style={{ maxHeight: "200px", minHeight: "200px" }}>
              {/* Mobile: horizontal scroll, Desktop: vertical list */}
              <div className="md:block">
                {conversations.map((convo) => {
                  const other = getOtherParticipant(convo)
                  const isActive = activeConvo === convo._id
                  return (
                    <button
                      key={convo._id}
                      onClick={() => setActiveConvo(convo._id)}
                      className={`w-full text-left px-4 py-3.5 border-b border-border/30 transition-all ${
                        isActive ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage src={other?.image} />
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-mono">
                            {other?.name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold truncate">{other?.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">
                            {convo.projectId?.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5 font-serif italic">
                            {convo.lastMessage}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-background min-h-0">
              {!activeConvo ? (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <MessageCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="font-serif text-muted-foreground italic text-sm">Select a conversation to start chatting</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="px-5 py-3.5 border-b border-border bg-card flex items-center gap-3 shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={otherUser?.image} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-mono">
                        {otherUser?.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold">{otherUser?.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{activeConversation?.projectId?.title}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
                    {messages.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground font-serif italic py-8">
                        No messages yet. Say hello!
                      </p>
                    )}
                    {messages.map((msg) => {
                      const isMe = msg.senderId?._id === user?.id
                      return (
                        <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] rounded-lg px-4 py-2.5 ${
                            isMe
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <p className={`text-[9px] mt-1 font-mono ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSend} className="px-4 py-3 border-t border-border bg-card flex gap-2 shrink-0">
                    <Input
                      placeholder="Type a message..."
                      className="flex-1 bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10 h-10"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sending}
                    />
                    <Button type="submit" size="icon" className="h-10 w-10 btn-glow shrink-0" disabled={sending || !newMessage.trim()}>
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </AnimatedSection>
      )}
    </div>
  )
}
