"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");

  const fetchDisputes = () => {
    fetch("/api/admin/disputes")
      .then((res) => res.json())
      .then((data) => {
        setDisputes(data.data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (id: string, resolution: "completed" | "cancelled") => {
    try {
      const res = await fetch(`/api/admin/disputes/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution, auditNote: note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Resolution failed");
      
      toast.success("Dispute resolved");
      setNote("");
      fetchDisputes();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return <div>Loading disputes...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Disputes</h1>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Parties</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disputes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">No active disputes.</TableCell>
              </TableRow>
            )}
            {disputes.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell className="font-medium">{contract.projectId?.title}</TableCell>
                <TableCell>
                  <div className="text-sm">Client: {contract.clientId?.name}</div>
                  <div className="text-sm">Freelancer: {contract.freelancerId?.name}</div>
                </TableCell>
                <TableCell>${contract.agreedRate}</TableCell>
                <TableCell className="max-w-xs truncate" title={contract.disputeReason}>
                  {contract.disputeReason}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">Resolve</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Resolve Dispute</DialogTitle>
                        <DialogDescription>
                          Review the dispute carefully. Resolving to "Completed" releases funds to the freelancer. Resolving to "Cancelled" refunds the client.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap border p-4 rounded-md h-32 overflow-y-auto">
                          {contract.disputeReason}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Audit Note (required)</label>
                          <Input 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Reason for resolution..."
                          />
                        </div>
                      </div>
                      <DialogFooter className="gap-2 sm:gap-0">
                        <Button 
                          variant="destructive"
                          disabled={!note}
                          onClick={() => handleResolve(contract.id, "cancelled")}
                        >
                          Cancel Contract (Refund)
                        </Button>
                        <Button 
                          variant="default"
                          disabled={!note}
                          onClick={() => handleResolve(contract.id, "completed")}
                        >
                          Complete Contract (Release)
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
