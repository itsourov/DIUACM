"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Pin,
  Lock,
  Clock,
  User,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ForumPostWithDetails, VoteType } from "@/db/schema";
import { voteOnPost, deleteForumPost } from "../actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ForumPostCardProps = {
  post: ForumPostWithDetails;
};

export function ForumPostCard({ post }: ForumPostCardProps) {
  const { data: session } = useSession();
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [optimisticVotes, setOptimisticVotes] = useState({
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    userVote: post.userVote?.voteType || null,
  });

  const netScore = optimisticVotes.upvotes - optimisticVotes.downvotes;
  const isAuthor = session?.user?.id === post.authorId;

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

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteForumPost(post.id);
      if (result.success) {
        toast.success(result.message || "Post deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete post");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete post"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Truncate content for preview
  const truncatedContent =
    post.content.length > 300
      ? post.content.substring(0, 300) + "..."
      : post.content;

  return (
    <Card className="transition-all duration-200 hover:shadow-md border border-slate-200 dark:border-slate-700">
      <CardContent>
        {/* Content Section */}
        <div className="w-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
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

            {/* Post Actions for Author */}
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/forum/post/${post.slug}/edit`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Edit className="h-3 w-3" />
                      Edit Post
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    {isDeleting ? "Deleting..." : "Delete Post"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Title */}
          <Link href={`/forum/post/${post.slug}`} className="block group">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
              {post.title}
            </h3>
          </Link>

          {/* Content Preview */}
          <div className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mb-3 line-clamp-2 sm:line-clamp-3">
            {truncatedContent}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              {/* Author */}
              <div className="flex items-center gap-1 sm:gap-2">
                <Avatar className="h-4 w-4 sm:h-5 sm:w-5">
                  <AvatarImage src={post.author.image || undefined} />
                  <AvatarFallback className="text-xs">
                    <User className="h-2 w-2 sm:h-3 sm:w-3" />
                  </AvatarFallback>
                </Avatar>
                <Link
                  href={`/programmers/${post.author.username}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-xs sm:text-sm"
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

              {/* Last Activity */}
              {post.lastActivityAt &&
                post.lastActivityAt !== post.createdAt && (
                  <div className="text-xs text-slate-400">
                    Last active{" "}
                    {formatDistanceToNow(new Date(post.lastActivityAt), {
                      addSuffix: true,
                    })}
                  </div>
                )}
            </div>

            {/* Vote Section */}
            <div className="flex items-center gap-1 self-start sm:self-auto">
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 w-6 sm:h-7 sm:w-7 p-0 ${
                  optimisticVotes.userVote === "upvote"
                    ? "text-orange-500 hover:text-orange-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                onClick={() => handleVote("upvote")}
                disabled={isVoting}
              >
                <ArrowUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Button>

              <span
                className={`text-xs sm:text-sm font-medium min-w-[24px] text-center ${
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
                className={`h-6 w-6 sm:h-7 sm:w-7 p-0 ${
                  optimisticVotes.userVote === "downvote"
                    ? "text-blue-500 hover:text-blue-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                onClick={() => handleVote("downvote")}
                disabled={isVoting}
              >
                <ArrowDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
