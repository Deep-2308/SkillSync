"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PostProjectForm } from "./PostProjectForm";

export default function PostProjectPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 pb-16 px-4 sm:px-6">
        <PostProjectForm />
      </main>
    </ProtectedRoute>
  );
}
