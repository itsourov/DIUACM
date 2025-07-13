"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Users,
  SunMedium,
  MoonStar,
  Building,
  BookOpen,
  CalendarRange,
  FileText,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
  onNavItemClick?: () => void;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

export function Sidebar({ className, onNavItemClick }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems: NavItem[] = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
      href: "/admin",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Users",
      href: "/admin/users",
    },
    {
      icon: <Building className="h-5 w-5" />,
      label: "Departments",
      href: "/admin/departments",
    },
    {
      icon: <CalendarRange className="h-5 w-5" />,
      label: "Semesters",
      href: "/admin/semesters",
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: "Courses",
      href: "/admin/courses",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Exam Types",
      href: "/admin/exam-types",
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      label: "Questions",
      href: "/admin/questions",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Contact Submissions",
      href: "/admin/contact-submissions",
    },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Handle nav item clicks
  const handleNavItemClick = () => {
    if (onNavItemClick) {
      onNavItemClick();
    }
  };

  return (
    <div
      className={cn("flex flex-col h-full border-r bg-background", className)}
    >
      {/* Logo area */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <span className="font-semibold text-lg">DIUQBank Admin</span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="px-3 py-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavItemClick}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* Footer actions - theme toggle only */}
      <div className="border-t p-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={toggleTheme}
        >
          {mounted && theme === "dark" ? (
            <>
              <SunMedium className="mr-2 h-4 w-4" />
              <span>Light mode</span>
            </>
          ) : (
            <>
              <MoonStar className="mr-2 h-4 w-4" />
              <span>Dark mode</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
