"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { createComment } from "../actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Link from "next/link";

type CommentFormProps = {
  postId: number;
  isLocked: boolean;
};

export function CommentForm({ postId, isLocked }: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Please log in to comment");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setIsSubmitting(true);

    try {
      await createComment({
        content: content.trim(),
        postId,
      });

      setContent("");
      toast.success("Comment posted successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to post comment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLocked) {
    return (
      <Card className="bg-slate-50 dark:bg-slate-800/50">
        <div className="text-center text-slate-500 dark:text-slate-400 px-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
            🔒
          </div>
          <p className="text-sm sm:text-base">
            This post is locked and no longer accepting comments.
          </p>
        </div>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="bg-slate-50 dark:bg-slate-800/50">
        <div className="text-center text-slate-500 dark:text-slate-400 px-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <p className="mb-3 text-sm sm:text-base">
            Please log in to join the discussion.
          </p>
          <Link href="/auth/signin">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4 px-6">
        <div className="flex gap-2 sm:gap-3">
          <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mt-1">
            <AvatarImage src={session.user?.image || undefined} />
            <AvatarFallback>
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <Textarea
              placeholder="What are your thoughts?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px] sm:min-h-[100px] resize-none text-sm"
              maxLength={2000}
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-3">
              <span className="text-xs text-slate-500">
                {content.length}/2000 characters
              </span>

              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="gap-2 self-end sm:self-auto"
                size="sm"
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
}
