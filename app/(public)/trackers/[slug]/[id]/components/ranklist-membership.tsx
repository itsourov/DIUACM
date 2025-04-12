"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2, LogIn } from "lucide-react";
import { joinRanklist, leaveRanklist } from "../../actions";
import { useRouter } from "next/navigation";

interface RanklistMembershipProps {
  rankListId: string;
  isUserInRanklist: boolean;
  isLoggedIn: boolean;
}

export function RanklistMembership({
  rankListId,
  isUserInRanklist: initialState,
  isLoggedIn,
}: RanklistMembershipProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUserInRanklist, setIsUserInRanklist] = useState(initialState);
  const router = useRouter();

  const handleJoinRanklist = async () => {
    // If not logged in, redirect to login
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const result = await joinRanklist(rankListId);

      if (result.success) {
        toast.success(result.message);
        setIsUserInRanklist(true);
      } else {
        toast.error(result.error || "Failed to join ranklist");
      }
    } catch (error) {
      console.error("Join ranklist error:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveRanklist = async () => {
    setIsLoading(true);
    try {
      const result = await leaveRanklist(rankListId);

      if (result.success) {
        toast.success(result.message);
        setIsUserInRanklist(false);
      } else {
        toast.error(result.error || "Failed to leave ranklist");
      }
    } catch (error) {
      console.error("Leave ranklist error:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      {isLoggedIn && isUserInRanklist ? (
        <Button
          variant="outline"
          onClick={handleLeaveRanklist}
          disabled={isLoading}
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/20 dark:hover:text-red-300"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <UserMinus className="h-4 w-4 mr-2" />
          )}
          Leave Ranklist
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={handleJoinRanklist}
          disabled={isLoading}
          className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:border-green-900/30 dark:hover:bg-green-900/20 dark:hover:text-green-300"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : isLoggedIn ? (
            <UserPlus className="h-4 w-4 mr-2" />
          ) : (
            <LogIn className="h-4 w-4 mr-2" />
          )}
          {isLoggedIn ? "Join Ranklist" : "Login to Join"}
        </Button>
      )}
    </div>
  );
}
