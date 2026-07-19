"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type EarningsChartProps = {
  data: { month: number; year: number; total: number }[];
};

export function EarningsChart({ data }: EarningsChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    
    // Sort data chronologically just to be safe
    const sortedData = [...data].sort((a, b) => 
      a.year === b.year ? a.month - b.month : a.year - b.year
    );
    
    return sortedData.map((d) => ({
      name: `${MONTHS[d.month - 1]} ${d.year.toString().slice(-2)}`,
      total: d.total,
    }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="h-[250px] w-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
        <p className="text-sm">No completed contracts yet.</p>
        <p className="text-xs mt-1 opacity-70">Earnings chart will appear here.</p>
      </div>
    );
  }

  // If there's only 1 data point, recharts sometimes renders it too wide, 
  // but BarChart handles it reasonably well with maxBarSize.
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(value) => `$${value}`}
          />
          <RechartsTooltip 
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
            contentStyle={{ 
              borderRadius: "8px", 
              border: "1px solid hsl(var(--border))",
              backgroundColor: "hsl(var(--background))",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              color: "hsl(var(--foreground))"
            }}
            formatter={(value: any) => [`$${value.toLocaleString()}`, "Earned"]}
            labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
          />
          <Bar 
            dataKey="total" 
            fill="hsl(var(--brand))" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={50}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
