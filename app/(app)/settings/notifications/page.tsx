"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NotificationPreferences {
  proposals: boolean;
  contracts: boolean;
  payments: boolean;
  reviews: boolean;
}

export default function NotificationsSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    proposals: true,
    contracts: true,
    payments: true,
    reviews: true,
  });

  useEffect(() => {
    async function fetchPreferences() {
      try {
        const res = await fetch("/api/users/me");
        if (!res.ok) throw new Error("Failed to load notification settings");
        const { data } = await res.json();
        
        if (data.notificationPreferences) {
          setPreferences({
            proposals: data.notificationPreferences.proposals ?? true,
            contracts: data.notificationPreferences.contracts ?? true,
            payments: data.notificationPreferences.payments ?? true,
            reviews: data.notificationPreferences.reviews ?? true,
          });
        }
      } catch (err) {
        toast.error("Could not load notification settings.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPreferences();
  }, []);

  const handleToggle = async (key: keyof NotificationPreferences) => {
    // Optimistic update
    const previous = { ...preferences };
    const next = { ...preferences, [key]: !preferences[key] };
    
    setPreferences(next);

    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationPreferences: next }),
      });

      if (!res.ok) throw new Error("Failed to save preference");
      
      toast.success("Preferences updated");
    } catch (err) {
      toast.error("Failed to update preference. Reverting.");
      setPreferences(previous); // Rollback
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Email Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Choose what types of emails you want to receive.
        </p>
      </div>
      
      <div className="border rounded-xl divide-y bg-card">
        
        <div className="flex items-center justify-between p-6">
          <div className="space-y-0.5 pr-4">
            <Label className="text-base font-medium text-foreground">Proposals</Label>
            <p className="text-sm text-muted-foreground">
              Receive emails when you get a new proposal or one of yours is accepted.
            </p>
          </div>
          <Switch 
            checked={preferences.proposals} 
            onCheckedChange={() => handleToggle("proposals")} 
          />
        </div>

        <div className="flex items-center justify-between p-6">
          <div className="space-y-0.5 pr-4">
            <Label className="text-base font-medium text-foreground">Contracts</Label>
            <p className="text-sm text-muted-foreground">
              Receive emails about contract starts, milestones, and completions.
            </p>
          </div>
          <Switch 
            checked={preferences.contracts} 
            onCheckedChange={() => handleToggle("contracts")} 
          />
        </div>

        <div className="flex items-center justify-between p-6">
          <div className="space-y-0.5 pr-4">
            <Label className="text-base font-medium text-foreground">Payments & Invoices</Label>
            <p className="text-sm text-muted-foreground">
              Receive emails for processed payments and billing receipts.
            </p>
          </div>
          <Switch 
            checked={preferences.payments} 
            onCheckedChange={() => handleToggle("payments")} 
          />
        </div>

        <div className="flex items-center justify-between p-6">
          <div className="space-y-0.5 pr-4">
            <Label className="text-base font-medium text-foreground">Reviews</Label>
            <p className="text-sm text-muted-foreground">
              Receive emails when you receive a new review from a client or freelancer.
            </p>
          </div>
          <Switch 
            checked={preferences.reviews} 
            onCheckedChange={() => handleToggle("reviews")} 
          />
        </div>

      </div>
    </div>
  );
}
