"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, ArrowDown, Reply, User, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ForumCommentWithAuthor, VoteType } from "@/db/schema";
import { voteOnComment, createComment } from "../actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Link from "next/link";

type CommentProps = {
  comment: ForumCommentWithAuthor;
  postId: number;
  depth?: number;
};

export function Comment({ comment, postId, depth = 0 }: CommentProps) {
  const { data: session } = useSession();
  const [isVoting, setIsVoting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const [optimisticVotes, setOptimisticVotes] = useState({
    upvotes: comment.upvotes,
    downvotes: comment.downvotes,
    userVote: comment.userVote?.voteType || null,
  });

  const netScore = optimisticVotes.upvotes - optimisticVotes.downvotes;
  const maxDepth = 3; // Maximum nesting depth for replies

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
      await voteOnComment(comment.id, voteType);
    } catch {
      // Revert optimistic update on error
      setOptimisticVotes({
        upvotes: comment.upvotes,
        downvotes: comment.downvotes,
        userVote: comment.userVote?.voteType || null,
      });
      toast.error("Failed to vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  const handleReply = async () => {
    if (!session) {
      toast.error("Please log in to reply");
      return;
    }

    if (!replyContent.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    setIsSubmittingReply(true);

    try {
      await createComment({
        content: replyContent.trim(),
        postId,
        parentId: comment.id,
      });

      setReplyContent("");
      setShowReplyForm(false);
      toast.success("Reply posted successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to post reply"
      );
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div
      className={`${
        depth > 0
          ? "ml-3 sm:ml-6 mt-4 border-l-2 border-slate-200 dark:border-slate-700 pl-3 sm:pl-4"
          : "mb-4"
      }`}
    >
      <Card>
        <div className="px-6">
          {/* Comment Content */}
          <div className="w-full">
            {/* Header */}
            <div className="flex items-center gap-1 sm:gap-2 mb-2 flex-wrap">
              <Avatar className="h-4 w-4 sm:h-5 sm:w-5">
                <AvatarImage src={comment.author.image || undefined} />
                <AvatarFallback className="text-xs">
                  <User className="h-2 w-2 sm:h-3 sm:w-3" />
                </AvatarFallback>
              </Avatar>

              <Link
                href={`/programmers/${comment.author.username}`}
                className="font-medium text-xs sm:text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {comment.author.name}
              </Link>

              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span>
                  {formatDistanceToNow(new Date(comment.createdAt!), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-3 whitespace-pre-wrap">
              {comment.content}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {depth < maxDepth && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 sm:h-6 px-2 text-xs text-slate-500 hover:text-slate-700"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    disabled={!session}
                  >
                    <Reply className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                    Reply
                  </Button>
                )}
              </div>

              {/* Vote Section */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-5 w-5 sm:h-6 sm:w-6 p-0 ${
                    optimisticVotes.userVote === "upvote"
                      ? "text-orange-500 hover:text-orange-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  onClick={() => handleVote("upvote")}
                  disabled={isVoting}
                >
                  <ArrowUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </Button>

                <span
                  className={`text-xs font-medium min-w-[20px] text-center ${
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
                  className={`h-5 w-5 sm:h-6 sm:w-6 p-0 ${
                    optimisticVotes.userVote === "downvote"
                      ? "text-blue-500 hover:text-blue-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  onClick={() => handleVote("downvote")}
                  disabled={isVoting}
                >
                  <ArrowDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </Button>
              </div>
            </div>

            {/* Reply Form */}
            {showReplyForm && (
              <div className="mt-3 space-y-3">
                <Textarea
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[60px] sm:min-h-[80px] text-xs sm:text-sm"
                  maxLength={2000}
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-xs text-slate-500">
                    {replyContent.length}/2000 characters
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyContent("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleReply}
                      disabled={isSubmittingReply || !replyContent.trim()}
                    >
                      {isSubmittingReply ? "Posting..." : "Post Reply"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
