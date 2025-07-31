"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Pin,
  Lock,
  Clock,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ForumPostWithDetails, VoteType } from "@/db/schema";
import { voteOnPost } from "../actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

type ForumPostCardProps = {
  post: ForumPostWithDetails;
};

export function ForumPostCard({ post }: ForumPostCardProps) {
  const { data: session } = useSession();
  const [isVoting, setIsVoting] = useState(false);
  const [optimisticVotes, setOptimisticVotes] = useState({
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    userVote: post.userVote?.voteType || null,
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
      await voteOnPost(post.id, voteType);
    } catch {
      // Revert optimistic update on error
      setOptimisticVotes({
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        userVote: post.userVote?.voteType || null,
      });
      toast.error("Failed to vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  // Truncate content for preview
  const truncatedContent =
    post.content.length > 300
      ? post.content.substring(0, 300) + "..."
      : post.content;

  return (
    <Card className="transition-all duration-200 hover:shadow-md border border-slate-200 dark:border-slate-700">
      <div className="flex gap-3 p-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center gap-1 min-w-[48px]">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${
              optimisticVotes.userVote === "upvote"
                ? "text-orange-500 hover:text-orange-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
            onClick={() => handleVote("upvote")}
            disabled={isVoting}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>

          <span
            className={`text-sm font-medium ${
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
            className={`h-8 w-8 p-0 ${
              optimisticVotes.userVote === "downvote"
                ? "text-blue-500 hover:text-blue-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
            onClick={() => handleVote("downvote")}
            disabled={isVoting}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Badge */}
              <Badge
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: `${post.category.color || "#6B7280"}20`,
                  color: post.category.color || "#6B7280",
                  borderColor: `${post.category.color || "#6B7280"}40`,
                }}
              >
                {post.category.name}
              </Badge>

              {/* Pin and Lock indicators */}
              {post.isPinned && <Pin className="h-3 w-3 text-green-500" />}
              {post.isLocked && <Lock className="h-3 w-3 text-red-500" />}
            </div>
          </div>

          {/* Title */}
          <Link href={`/forum/post/${post.slug}`} className="block group">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
              {post.title}
            </h3>
          </Link>

          {/* Content Preview */}
          <div className="text-slate-600 dark:text-slate-300 text-sm mb-3 line-clamp-3">
            {truncatedContent}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              {/* Author */}
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={post.author.image || undefined} />
                  <AvatarFallback className="text-xs">
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <Link
                  href={`/programmers/${post.author.username}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {post.author.name}
                </Link>
              </div>

              {/* Comments Count */}
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{post._count.comments}</span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(post.createdAt!), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            {/* Last Activity */}
            {post.lastActivityAt && post.lastActivityAt !== post.createdAt && (
              <div className="text-xs text-slate-400">
                Last active{" "}
                {formatDistanceToNow(new Date(post.lastActivityAt), {
                  addSuffix: true,
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
