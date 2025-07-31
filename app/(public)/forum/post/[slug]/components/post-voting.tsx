"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { VoteType } from "@/db/schema";
import { voteOnPost } from "../../../actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

type PostVotingProps = {
  postId: number;
  initialUpvotes: number;
  initialDownvotes: number;
  userVote: VoteType | null;
};

export function PostVoting({
  postId,
  initialUpvotes,
  initialDownvotes,
  userVote,
}: PostVotingProps) {
  const { data: session } = useSession();
  const [isVoting, setIsVoting] = useState(false);
  const [optimisticVotes, setOptimisticVotes] = useState({
    upvotes: initialUpvotes,
    downvotes: initialDownvotes,
    userVote: userVote,
  });

  const netScore = optimisticVotes.upvotes - optimisticVotes.downvotes;

  const handleVote = async (voteType: VoteType) => {
    if (!session) {
      toast.error("Please log in to vote");
      return;
    }

    if (isVoting) return;

    setIsVoting(true);

    // Optimistic update
    const currentUserVote = optimisticVotes.userVote;
    let newUpvotes = optimisticVotes.upvotes;
    let newDownvotes = optimisticVotes.downvotes;
    let newUserVote: VoteType | null = voteType;

    if (currentUserVote === voteType) {
      // User is removing their vote
      newUserVote = null;
      if (voteType === "upvote") {
        newUpvotes -= 1;
      } else {
        newDownvotes -= 1;
      }
    } else if (currentUserVote) {
      // User is changing their vote
      if (currentUserVote === "upvote" && voteType === "downvote") {
        newUpvotes -= 1;
        newDownvotes += 1;
      } else if (currentUserVote === "downvote" && voteType === "upvote") {
        newDownvotes -= 1;
        newUpvotes += 1;
      }
    } else {
      // User is voting for the first time
      if (voteType === "upvote") {
        newUpvotes += 1;
      } else {
        newDownvotes += 1;
      }
    }

    setOptimisticVotes({
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      userVote: newUserVote,
    });

    try {
      await voteOnPost(postId, voteType);
    } catch {
      // Revert optimistic update on error
      setOptimisticVotes({
        upvotes: initialUpvotes,
        downvotes: initialDownvotes,
        userVote: userVote,
      });
      toast.error("Failed to vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 min-w-[64px]">
      <Button
        variant="ghost"
        size="sm"
        className={`h-10 w-10 p-0 ${
          optimisticVotes.userVote === "upvote"
            ? "text-orange-500 hover:text-orange-600 bg-orange-50 dark:bg-orange-950"
            : "text-slate-400 hover:text-slate-600"
        }`}
        onClick={() => handleVote("upvote")}
        disabled={isVoting}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>

      <span
        className={`text-lg font-bold ${
          netScore > 0
            ? "text-orange-500"
            : netScore < 0
            ? "text-blue-500"
            : "text-slate-500"
        }`}
      >
        {netScore > 0 ? `+${netScore}` : netScore}
      </span>

      <Button
        variant="ghost"
        size="sm"
        className={`h-10 w-10 p-0 ${
          optimisticVotes.userVote === "downvote"
            ? "text-blue-500 hover:text-blue-600 bg-blue-50 dark:bg-blue-950"
            : "text-slate-400 hover:text-slate-600"
        }`}
        onClick={() => handleVote("downvote")}
        disabled={isVoting}
      >
        <ArrowDown className="h-5 w-5" />
      </Button>
    </div>
  );
}
