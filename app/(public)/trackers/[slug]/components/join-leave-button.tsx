"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { joinRanklist, leaveRanklist } from "../../actions";

interface JoinLeaveButtonProps {
  rankListId: number;
  userInRanklist: boolean;
  className?: string;
}

export function JoinLeaveButton({
  rankListId,
  userInRanklist: initialUserInRanklist,
  className,
}: JoinLeaveButtonProps) {
  const [userInRanklist, setUserInRanklist] = useState(initialUserInRanklist);
  const [isPending, startTransition] = useTransition();

  const handleToggleMembership = async () => {
    startTransition(async () => {
      try {
        if (userInRanklist) {
          // Leave ranklist
          const result = await leaveRanklist(rankListId);
          if (result.success) {
            setUserInRanklist(false);
            toast.success(result.message || "Successfully left the ranklist");
          } else {
            toast.error(result.error || "Failed to leave ranklist");
          }
        } else {
          // Join ranklist
          const result = await joinRanklist(rankListId);
          if (result.success) {
            setUserInRanklist(true);
            toast.success(result.message || "Successfully joined the ranklist");
          } else {
            toast.error(result.error || "Failed to join ranklist");
          }
        }
      } catch (error) {
        console.error("Toggle membership error:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <Button
      onClick={handleToggleMembership}
      disabled={isPending}
      size="sm"
      variant={userInRanklist ? "outline" : "default"}
      className={className}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : userInRanklist ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          Leave
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Join
        </>
      )}
    </Button>
  );
}
