"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/topnav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { isAuthenticated, getUser } from "@/lib/auth";
import { updateUserProfile } from "@/actions/user-actions";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Demo auth check
    if (!isAuthenticated()) {
      router.push("/login");
    } else {
      const user = getUser();
      if (user) {
        // Sync local storage user to the SQLite database
        updateUserProfile({
          name: user.name,
          email: user.email,
          farmName: user.farmName,
          phone: user.phone || "",
        }).then((res) => {
          if (!res.success) {
            console.error("[Sync] Failed to sync user to database:", res.error);
          } else {
            console.log("[Sync] User synced to database:", res.user?.id);
          }
        });
      }
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
