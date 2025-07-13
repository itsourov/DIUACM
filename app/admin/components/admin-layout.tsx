"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { UserDropdown } from "./user-dropdown";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    setShowMobileSidebar(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop layout */}
      <div className="hidden md:flex">
        {/* Fixed sidebar */}
        <div className="fixed inset-y-0 z-20 flex w-64 flex-col">
          <Sidebar />
        </div>

        {/* Main content area */}
        <div className="pl-64 flex-1 flex flex-col min-h-screen">
          <header className="sticky top-0 z-10 h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 md:px-6">
            <div>
              <h1 className="text-xl font-medium">
                {pathname === "/admin"
                  ? "Dashboard"
                  : pathname.includes("/users")
                  ? "Users"
                  : pathname.includes("/events")
                  ? "Events"
                  : pathname.includes("/ranklists")
                  ? "Ranklists"
                  : pathname.includes("/trackers")
                  ? "Trackers"
                  : pathname.includes("/settings")
                  ? "Settings"
                  : "Admin"}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <UserDropdown />
            </div>
          </header>

          <main className="flex-1 px-4 py-8 md:px-6 lg:px-8">{children}</main>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex min-h-screen flex-col md:hidden">
        <header className="sticky top-0 z-10 h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileSidebar(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
            <h1 className="text-lg font-medium">
              {pathname === "/admin"
                ? "Dashboard"
                : pathname.includes("/users")
                ? "Users"
                : pathname.includes("/events")
                ? "Events"
                : pathname.includes("/ranklists")
                ? "Ranklists"
                : pathname.includes("/trackers")
                ? "Trackers"
                : pathname.includes("/settings")
                ? "Settings"
                : "Admin"}
            </h1>
          </div>

          <div>
            <UserDropdown />
          </div>
        </header>

        {/* Mobile sidebar */}
        <Sheet open={showMobileSidebar} onOpenChange={setShowMobileSidebar}>
          <SheetContent side="left" className="p-0 w-[280px]">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <Sidebar
              isMobile={true}
              onNavItemClick={() => setShowMobileSidebar(false)}
            />
          </SheetContent>
        </Sheet>

        <main className="flex-1 px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
