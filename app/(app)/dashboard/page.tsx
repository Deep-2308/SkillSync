"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardClient } from "./DashboardClient";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardClient />
    </ProtectedRoute>
  );
}
