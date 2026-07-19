import { Metadata } from "next";
import { EarningsClient } from "./EarningsClient";

export const metadata: Metadata = {
  title: "Earnings | SkillSync",
};

export default function EarningsPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Earnings</h1>
        <p className="text-muted-foreground mt-1">
          Track your lifetime earnings, pending escrows, and request withdrawals.
        </p>
      </div>

      <EarningsClient />
    </div>
  );
}
