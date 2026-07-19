"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { DollarSign, ArrowUpRight, Clock, AlertCircle, CheckCircle2, History } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function EarningsClient() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const fetchEarnings = async () => {
    try {
      const res = await fetch("/api/earnings");
      const json = await res.json();
      if (res.ok) {
        setData(json.data);
      } else {
        toast.error(json.error || "Failed to load earnings");
      }
    } catch (err) {
      toast.error("Error loading earnings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setIsWithdrawing(true);
    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const json = await res.json();
      
      if (res.ok) {
        toast.success(`Withdrawal request for $${amount} submitted!`);
        setIsWithdrawOpen(false);
        setWithdrawAmount("");
        fetchEarnings(); // Refresh data
      } else {
        toast.error(json.error || "Failed to submit withdrawal");
      }
    } catch (err) {
      toast.error("Error submitting withdrawal request");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading financial data...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-destructive">Failed to load financial data.</div>;
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-2xl border p-6 flex flex-col justify-between hover:border-brand/40 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Available Balance</h3>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">${data.availableBalance.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Ready for withdrawal</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-6 flex flex-col justify-between hover:border-brand/40 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Pending Balance</h3>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">${data.pendingBalance.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Funded but not yet delivered</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-6 flex flex-col justify-between hover:border-brand/40 transition-colors shadow-sm bg-gradient-to-br from-brand/5 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Lifetime Earned</h3>
            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">${data.lifetimeEarned.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total across all contracts</p>
          </div>
        </div>
      </div>

      {/* Withdraw Section */}
      <div className="bg-card rounded-2xl border p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-foreground">Withdraw Earnings</h2>
          <p className="text-muted-foreground text-sm mt-1 max-w-xl">
            You can request a withdrawal of your available balance at any time. 
            <strong> Please note:</strong> Automatic Stripe Connect payouts are not yet enabled. 
            Withdrawals are processed manually by our administration team.
          </p>
        </div>
        <Button 
          onClick={() => setIsWithdrawOpen(true)} 
          disabled={data.availableBalance <= 0}
          className="shrink-0 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Request Withdrawal
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* History Table */}
        <div className="lg:col-span-2 bg-card rounded-2xl border overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-bold text-foreground">Recent Releases</h2>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {data.history.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No earnings history found. Complete a contract to see funds released here.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/30 text-muted-foreground uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Client</th>
                    <th className="px-6 py-4 font-medium">Project</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.history.map((tx: any) => (
                    <tr key={tx._id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {format(new Date(tx.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        <div className="flex items-center gap-2">
                          {tx.clientId?.image ? (
                            <img src={tx.clientId.image} alt="" className="w-6 h-6 rounded-full border" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold border">
                              {tx.clientId?.name?.[0] || "C"}
                            </div>
                          )}
                          {tx.clientId?.name || "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {tx.contractId?.projectId?.title || "Contract"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-emerald-600">
                        +${tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Monthly Chart (Simple Visuals) */}
        <div className="bg-card rounded-2xl border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-6">Monthly Earnings</h2>
          
          {data.chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-xl">
              No data available
            </div>
          ) : (
            <div className="space-y-4">
              {data.chartData.map((d: any) => {
                const max = Math.max(...data.chartData.map((x: any) => x.earned));
                const width = `${(d.earned / max) * 100}%`;
                
                return (
                  <div key={d.month} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-muted-foreground">{d.month}</span>
                      <span className="font-bold text-foreground">${d.earned.toFixed(2)}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-brand rounded-full" style={{ width }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              <div className="mt-2 p-3 bg-amber-50 text-amber-800 rounded-md border border-amber-200 text-sm">
                <AlertCircle className="w-4 h-4 inline-block mr-1 -mt-0.5" />
                Automatic payouts are currently disabled. A site administrator will manually review and process your withdrawal.
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Available to withdraw</label>
              <p className="text-2xl font-bold text-emerald-600">${data.availableBalance.toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount ($)</label>
              <Input 
                type="number"
                placeholder="0.00"
                min="0"
                max={data.availableBalance}
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWithdrawOpen(false)} disabled={isWithdrawing}>
              Cancel
            </Button>
            <Button 
              onClick={handleWithdraw} 
              disabled={isWithdrawing || !withdrawAmount} 
            >
              {isWithdrawing ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
