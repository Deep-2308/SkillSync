"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, isToday, isYesterday } from "date-fns";
import { Bell, Check, CheckCircle2, ChevronRight, FileText, MessageSquare, Star, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NotificationData {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export function NotificationsClient() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/notifications", window.location.origin);
      url.searchParams.set("limit", "50");
      if (filter === "unread") {
        url.searchParams.set("filter", "unread");
      }
      
      const res = await fetch(url.toString());
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data.notifications);
        setTotal(json.data.total);
        setUnreadCount(json.data.unread);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const getIcon = (type: string, read: boolean) => {
    const className = `w-5 h-5 ${read ? "text-muted-foreground" : "text-brand"}`;
    switch (type) {
      case "contract_update":
        return <CheckCircle2 className={className} />;
      case "review_prompt":
      case "review_received":
        return <Star className={className} />;
      case "proposal_received":
      case "proposal_update":
        return <FileText className={className} />;
      case "new_message":
        return <MessageSquare className={className} />;
      default:
        return <Bell className={className} />;
    }
  };

  // Group notifications by day
  const grouped = notifications.reduce((acc, notif) => {
    const date = new Date(notif.createdAt);
    let key = "Older";
    if (isToday(date)) key = "Today";
    else if (isYesterday(date)) key = "Yesterday";
    else key = format(date, "MMMM d, yyyy");

    if (!acc[key]) acc[key] = [];
    acc[key].push(notif);
    return acc;
  }, {} as Record<string, NotificationData[]>);

  const markRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0 || loading}>
            <Check className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/settings">
              <Settings className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-8">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-card border rounded-2xl p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">You're all caught up!</h3>
            <p className="text-muted-foreground">
              {filter === "unread" ? "You have no unread notifications." : "You have no notifications yet."}
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="space-y-4">
              <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">{group}</h3>
              <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                {items.map((notif, index) => (
                  <Link 
                    key={notif.id}
                    href={notif.link || "#"}
                    onClick={() => !notif.read && markRead(notif.id)}
                    className={`flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors ${index !== 0 ? "border-t" : ""} ${!notif.read ? "bg-brand/5 hover:bg-brand/10" : ""}`}
                  >
                    <div className="shrink-0 mt-1">
                      {getIcon(notif.type, notif.read)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-semibold text-sm ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                          {notif.title}
                        </p>
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-brand shrink-0"></span>}
                      </div>
                      <p className={`text-sm ${!notif.read ? "text-foreground/90" : "text-muted-foreground"}`}>
                        {notif.body}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 font-medium">
                        {format(new Date(notif.createdAt), "h:mm a")}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center justify-center text-muted-foreground/50 self-center">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
