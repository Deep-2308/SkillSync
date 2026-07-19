import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { VerifyEmailBanner } from "./VerifyEmailBanner";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  await connectToDatabase();
  const dbUser = await User.findById(session.user.id).select("emailVerified").lean();
  const needsVerification = !dbUser?.emailVerified;

  return (
    <div className="flex min-h-dvh bg-muted/10">
      {/* Desktop Sidebar handles rendering both mobile Drawer and desktop aside */}
      <Sidebar role={session.user.role} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={session.user} />
        
        <main className="flex-1 overflow-y-auto outline-none flex flex-col">
          {needsVerification && <VerifyEmailBanner />}
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
