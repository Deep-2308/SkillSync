"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function AdminOperationsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawalNotes, setWithdrawalNotes] = useState<Record<string, string>>({});

  const fetchContacts = () => fetch("/api/admin/operations/contacts").then(r=>r.json()).then(d=>setContacts(d.data));
  const fetchWithdrawals = () => fetch("/api/admin/operations/withdrawals").then(r=>r.json()).then(d=>setWithdrawals(d.data));

  useEffect(() => {
    fetchContacts();
    fetchWithdrawals();
  }, []);

  const handleMarkContactRead = async (id: string) => {
    try {
      await fetch(`/api/admin/operations/contacts/${id}`, { method: "PATCH" });
      toast.success("Marked as read");
      fetchContacts();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleWithdrawalAction = async (id: string, status: "processed" | "rejected") => {
    try {
      const res = await fetch(`/api/admin/operations/withdrawals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote: withdrawalNotes[id] }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(`Withdrawal ${status}`);
      fetchWithdrawals();
    } catch {
      toast.error("Failed to process withdrawal");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Operations</h1>
      <Tabs defaultValue="withdrawals">
        <TabsList>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="contacts">Contact Inbox</TabsTrigger>
        </TabsList>

        <TabsContent value="withdrawals" className="space-y-4 pt-4">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Freelancer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stripe ID</TableHead>
                  <TableHead>Note & Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No withdrawals.</TableCell></TableRow>
                )}
                {withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>{w.freelancerId?.name}</TableCell>
                    <TableCell>${w.amount}</TableCell>
                    <TableCell>
                      <Badge variant={w.status === "pending" ? "secondary" : w.status === "processed" ? "default" : "destructive"}>
                        {w.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{w.freelancerId?.stripeAccountId || "No Stripe ID"}</TableCell>
                    <TableCell>
                      {w.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            placeholder="Admin Note..." 
                            className="h-8 w-40"
                            value={withdrawalNotes[w.id] || ""}
                            onChange={(e) => setWithdrawalNotes(prev => ({ ...prev, [w.id]: e.target.value }))}
                          />
                          <Button size="sm" onClick={() => handleWithdrawalAction(w.id, "processed")}>Pay</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleWithdrawalAction(w.id, "rejected")}>Reject</Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">{w.adminNote || "-"}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4 pt-4">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Inbox zero!</TableCell></TableRow>
                )}
                {contacts.map((c) => (
                  <TableRow key={c.id} className={!c.readAt ? "font-semibold bg-muted/50" : ""}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.subject}</TableCell>
                    <TableCell className="max-w-md truncate">{c.message}</TableCell>
                    <TableCell>
                      {!c.readAt && (
                        <Button variant="outline" size="sm" onClick={() => handleMarkContactRead(c.id)}>Mark Read</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
