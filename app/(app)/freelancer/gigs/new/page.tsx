import { Metadata } from "next";
import { GigForm } from "./GigForm";

export const metadata: Metadata = {
  title: "Create Gig | SkillSync",
};

export default function NewGigPage() {
  return (
    <main className="min-h-screen bg-muted/40 pt-24 pb-20">
      <div className="container mx-auto px-4">
        <GigForm />
      </div>
    </main>
  );
}
