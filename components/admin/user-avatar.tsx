"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  className?: string;
}

export function UserAvatar({ className }: UserAvatarProps) {
  const { data: session } = useSession();
  const user = session?.user;

  // Get initials for the fallback
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Avatar className={cn("h-8 w-8", className)}>
      {user?.image ? (
        <AvatarImage
          src={user.image}
          alt={user.name || "User"}
          className="object-cover"
        />
      ) : null}
      <AvatarFallback className="bg-muted text-foreground text-xs font-medium">
        {getInitials(user?.name)}
      </AvatarFallback>
    </Avatar>
  );
}
