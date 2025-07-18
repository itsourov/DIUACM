"use client";

import { useState, useTransition } from "react";
import { Plus, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { joinRankList, leaveRankList, isUserInRankList } from "../actions";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

interface RankListActionsProps {
  rankListId: number;
}

export function RankListActions({ rankListId }: RankListActionsProps) {
  const { data: session, status } = useSession();
  const [isInRankList, setIsInRankList] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Check if user is in ranklist
  useEffect(() => {
    if (session?.user?.id) {
      isUserInRankList(session.user.id, rankListId).then(setIsInRankList);
    }
  }, [session?.user?.id, rankListId]);

  const handleJoinRankList = async () => {
    if (!session?.user?.id) return;

    startTransition(async () => {
      const result = await joinRankList(session.user!.id!, rankListId);
      if (result.success) {
        setIsInRankList(true);
        router.refresh();
      }
    });
  };

  const handleLeaveRankList = async () => {
    if (!session?.user?.id) return;

    startTransition(async () => {
      const result = await leaveRankList(session.user!.id!, rankListId);
      if (result.success) {
        setIsInRankList(false);
        router.refresh();
      }
    });
  };

  if (status === "loading") {
    return (
      <Button variant="outline" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  if (!session) {
    return (
      <Button variant="outline" size="sm" asChild>
        <a href="/login" className="gap-x-1.5">
          <LogIn className="h-4 w-4" />
          Login to Join
        </a>
      </Button>
    );
  }

  if (isInRankList) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleLeaveRankList}
        disabled={isPending}
        className="gap-x-1.5 text-red-700 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
      >
        <X className="h-4 w-4" />
        {isPending ? "Leaving..." : "Leave Ranklist"}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleJoinRankList}
      disabled={isPending}
      className="gap-x-1.5 text-green-700 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20"
    >
      <Plus className="h-4 w-4" />
      {isPending ? "Joining..." : "Join Ranklist"}
    </Button>
  );
}
