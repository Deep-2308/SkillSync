import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh bg-muted/10">
      {/* Desktop Sidebar handles rendering both mobile Drawer and desktop aside */}
      <Sidebar role={session.user.role} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={session.user} />
        
        <main className="flex-1 overflow-y-auto outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
