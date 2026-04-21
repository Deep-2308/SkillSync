"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatedSection } from "@/components/animated-section"
import { useAuth } from "@/context/AuthContext"
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
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [activeConvo, setActiveConvo] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch conversations
  useEffect(() => {
    const fetchConvos = async () => {
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
    fetchConvos()
  }, [])

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (convoId: string, afterTimestamp?: string) => {
    try {
      let url = `/api/messages?conversationId=${convoId}`
      if (afterTimestamp) url += `&after=${afterTimestamp}`

      const res = await fetch(url)
      const data = await res.json()

      if (data.messages) {
        if (afterTimestamp) {
          // Append new messages (polling)
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m._id))
            const newMsgs = data.messages.filter((m: MessageItem) => !existingIds.has(m._id))
            return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev
          })
        } else {
          setMessages(data.messages)
        }
      }
    } catch {
      // handled
    }
  }, [])

  // Open a conversation
  const openConversation = (convoId: string) => {
    setActiveConvo(convoId)
    setMessages([])
    fetchMessages(convoId)
  }

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!activeConvo) return

    pollRef.current = setInterval(() => {
      const lastMsg = messages[messages.length - 1]
      const after = lastMsg?.createdAt || ""
      if (after) fetchMessages(activeConvo, after)
    }, 3000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [activeConvo, messages, fetchMessages])

  // Auto-scroll to bottom
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

      if (data.message) {
        // Add message locally with populated sender
        setMessages((prev) => [
          ...prev,
          {
            ...data.message,
            senderId: { _id: user!.id, name: user!.name, image: undefined },
          },
        ])
        setNewMessage("")

        // Update conversation list preview
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConvo
              ? { ...c, lastMessage: newMessage.trim(), lastMessageAt: new Date().toISOString() }
              : c
          )
        )
      }
    } catch {
      // handled
    } finally {
      setSending(false)
    }
  }

  const getOtherParticipant = (convo: ConversationItem) => {
    return convo.participants.find((p) => p._id !== user?.id) || convo.participants[0]
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnimatedSection animation="slideUp" delay={0}>
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary/60 mb-1 block">Communication</span>
        <h1 className="font-display text-2xl font-bold tracking-tight">Messages</h1>
      </AnimatedSection>

      {conversations.length === 0 ? (
        <AnimatedSection animation="fadeIn" delay={80}>
          <div className="text-center py-20 border border-dashed border-border rounded-lg">
            <MessageCircle className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
            <p className="font-serif text-muted-foreground italic mb-2">No conversations yet</p>
            <p className="text-xs text-muted-foreground">
              Conversations are created when a client accepts a freelancer&apos;s proposal
            </p>
          </div>
        </AnimatedSection>
      ) : (
        <div className="flex gap-4 h-[65vh]">
          {/* Conversation List */}
          <div className="w-72 shrink-0 border border-border rounded-lg overflow-y-auto bg-card">
            {conversations.map((convo) => {
              const other = getOtherParticipant(convo)
              const isActive = activeConvo === convo._id

              return (
                <button
                  key={convo._id}
                  onClick={() => openConversation(convo._id)}
                  className={`w-full text-left p-4 border-b border-border/40 transition-colors ${
                    isActive ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={other.image || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {other.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{other.name}</p>
                      <p className="text-[10px] font-mono text-primary/60 truncate">{convo.projectId.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{convo.lastMessage}</p>
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                      {formatTime(convo.lastMessageAt)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Chat Area */}
          <div className="flex-1 border border-border rounded-lg flex flex-col bg-card overflow-hidden">
            {!activeConvo ? (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <MessageCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-serif text-sm text-muted-foreground italic">Select a conversation to start chatting</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                {(() => {
                  const convo = conversations.find((c) => c._id === activeConvo)
                  const other = convo ? getOtherParticipant(convo) : null
                  return convo && other ? (
                    <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={other.image || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{other.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{other.name}</p>
                        <p className="text-[10px] font-mono text-primary/60">{convo.projectId.title}</p>
                      </div>
                    </div>
                  ) : null
                })()}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {messages.map((msg) => {
                    const isMe = msg.senderId._id === user?.id
                    return (
                      <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] ${isMe ? "order-2" : ""}`}>
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm ${
                              isMe
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted text-foreground rounded-bl-md"
                            }`}
                          >
                            {msg.content}
                          </div>
                          <p className={`text-[9px] font-mono text-muted-foreground mt-1 ${isMe ? "text-right" : ""}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="px-4 py-3 border-t border-border flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    className="flex-1 bg-muted border-border focus-visible:border-primary/40 focus-visible:ring-primary/10"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                  />
                  <Button type="submit" size="icon" className="btn-glow h-10 w-10 shrink-0" disabled={sending || !newMessage.trim()}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
