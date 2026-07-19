import { Metadata } from "next";
import { PaymentsClient } from "./PaymentsClient";

export const metadata: Metadata = {
  title: "Payments History | SkillSync",
};

export default function PaymentsPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payments History</h1>
        <p className="text-muted-foreground mt-1">
          Review your funded escrows, refunds, and total spending across all contracts.
        </p>
      </div>

      <PaymentsClient />
    </div>
  );
}
