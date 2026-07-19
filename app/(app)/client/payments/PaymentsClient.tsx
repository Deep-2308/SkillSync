"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { DollarSign, Receipt, CreditCard, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function PaymentsClient() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch("/api/client/payments");
        const json = await res.json();
        if (res.ok) {
          setData(json.data);
        } else {
          toast.error(json.error || "Failed to load payments");
        }
      } catch (err) {
        toast.error("Error loading payments");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPayments();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading payment history...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-destructive">Failed to load payment history.</div>;
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-2xl border p-6 flex flex-col justify-between hover:border-brand/40 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Total Spent</h3>
            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">${data.totalSpent.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Lifetime total across all contracts</p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-card rounded-2xl border overflow-hidden shadow-sm flex flex-col">
        <div className="p-6 border-b flex items-center gap-2">
          <Receipt className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-bold text-foreground">Payment History</h2>
        </div>
        
        <div className="flex-1 overflow-x-auto">
          {data.history.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No payments found. Fund a contract to see it here.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/30 text-muted-foreground uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Freelancer</th>
                  <th className="px-6 py-4 font-medium">Project</th>
                  <th className="px-6 py-4 font-medium">Payment Method</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.history.map((tx: any) => (
                  <tr key={tx._id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {format(new Date(tx.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.type === "funding" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Payment
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          Refund
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      <div className="flex items-center gap-2">
                        {tx.freelancerId?.image ? (
                          <img src={tx.freelancerId.image} alt="" className="w-6 h-6 rounded-full border" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold border">
                            {tx.freelancerId?.name?.[0] || "F"}
                          </div>
                        )}
                        {tx.freelancerId?.name || "Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {tx.contractId?.projectId?.title || "Contract"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.metadata?.cardBrand && tx.metadata?.cardLast4 ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CreditCard className="w-4 h-4" />
                          <span className="capitalize">{tx.metadata.cardBrand}</span> •••• {tx.metadata.cardLast4}
                          {tx.metadata.receiptUrl && (
                            <Link href={tx.metadata.receiptUrl} target="_blank" rel="noreferrer" className="text-brand hover:underline ml-2" title="View Receipt">
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${tx.type === "funding" ? "text-foreground" : "text-slate-500"}`}>
                      {tx.type === "refund" ? "-" : ""}${tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
