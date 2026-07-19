import { Metadata } from "next";
import { getAuthSession } from "@/lib/api-utils";
import { MessagesClient } from "./MessagesClient";

export const metadata: Metadata = {
  title: "Messages | SkillSync",
};

export default async function MessagesPage() {
  const session = await getAuthSession();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Communicate with your clients and freelancers.
        </p>
      </div>
      
      <MessagesClient currentUserId={session.user.id} />
    </div>
  );
}
