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
      <Card className="p-6 bg-slate-50 dark:bg-slate-800/50">
        <div className="text-center text-slate-500 dark:text-slate-400">
          <div className="w-12 h-12 mx-auto mb-3 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
            🔒
          </div>
          <p>This post is locked and no longer accepting comments.</p>
        </div>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="p-6 bg-slate-50 dark:bg-slate-800/50">
        <div className="text-center text-slate-500 dark:text-slate-400">
          <div className="w-12 h-12 mx-auto mb-3 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <User className="h-6 w-6" />
          </div>
          <p className="mb-3">Please log in to join the discussion.</p>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src={session.user?.image || undefined} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <Textarea
              placeholder="What are your thoughts?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={2000}
            />

            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-500">
                {content.length}/2000 characters
              </span>

              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="gap-2"
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
