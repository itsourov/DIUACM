import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MessageSquare,
  Pin,
  Lock,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { getForumPost, getForumComments } from "./actions";
import { Comment } from "./components/comment";
import { CommentForm } from "./components/comment-form";
import { PostVoting } from "./components/post-voting";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getForumPost(slug);

    return {
      title: `${post.title} - Forum - DIU ACM`,
      description:
        post.content.substring(0, 160) +
        (post.content.length > 160 ? "..." : ""),
    };
  } catch {
    return {
      title: "Post Not Found - Forum - DIU ACM",
      description: "The requested forum post could not be found.",
    };
  }
}

export default async function ForumPostPage({ params }: PageProps) {
  const { slug } = await params;

  let post;
  try {
    post = await getForumPost(slug);
  } catch {
    notFound();
  }

  const comments = await getForumComments(post.id);
  const netScore = post.upvotes - post.downvotes;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Navigation */}
      <div className="mb-6">
        <Link href="/forum">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Forum
          </Button>
        </Link>
      </div>

      {/* Main Post */}
      <Card className="mb-8">
        <div className="px-6">
          <div className="w-full">
            {/* Post Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-4">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                {/* Category Badge */}
                <Badge
                  variant="secondary"
                  className="text-sm"
                  style={{
                    backgroundColor: `${post.category.color || "#6B7280"}20`,
                    color: post.category.color || "#6B7280",
                    borderColor: `${post.category.color || "#6B7280"}40`,
                  }}
                >
                  {post.category.name}
                </Badge>

                {/* Pin and Lock indicators */}
                {post.isPinned && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Pin className="h-4 w-4" />
                    <span className="text-sm font-medium">Pinned</span>
                  </div>
                )}
                {post.isLocked && (
                  <div className="flex items-center gap-1 text-red-600">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm font-medium">Locked</span>
                  </div>
                )}
              </div>

              {/* Vote Score */}
              <div className="flex items-center gap-1 text-sm font-medium">
                {netScore > 0 ? (
                  <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                ) : netScore < 0 ? (
                  <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                ) : null}
                <span
                  className={
                    netScore > 0
                      ? "text-orange-500"
                      : netScore < 0
                      ? "text-blue-500"
                      : "text-slate-500"
                  }
                >
                  {netScore > 0 ? `+${netScore}` : netScore} votes
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              {post.title}
            </h1>

            {/* Post Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1 sm:gap-2">
                <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                  <AvatarImage src={post.author.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {post.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Link
                  href={`/programmers/${post.author.username}`}
                  className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {post.author.name}
                </Link>
              </div>

              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>
                  {formatDistanceToNow(new Date(post.createdAt!), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{post._count.comments} comments</span>
              </div>

              {post.lastActivityAt &&
                post.lastActivityAt !== post.createdAt && (
                  <div className="text-xs">
                    Last active{" "}
                    {formatDistanceToNow(new Date(post.lastActivityAt), {
                      addSuffix: true,
                    })}
                  </div>
                )}
            </div>

            {/* Post Content */}
            <div className="prose prose-slate dark:prose-invert max-w-none mb-4">
              <div className="whitespace-pre-wrap text-sm sm:text-base text-slate-700 dark:text-slate-300">
                {post.content}
              </div>
            </div>

            {/* Voting Section at Bottom */}
            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
              <PostVoting
                postId={post.id}
                initialUpvotes={post.upvotes}
                initialDownvotes={post.downvotes}
                userVote={post.userVote?.voteType || null}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Comments Section */}
      <div className="space-y-4 sm:space-y-6">
        {/* Comments Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            Comments ({comments.length})
          </h2>
        </div>

        {/* Comment Form */}
        <CommentForm postId={post.id} isLocked={post.isLocked} />

        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Comment key={comment.id} comment={comment} postId={post.id} />
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center px-6">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-slate-500 dark:text-slate-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-slate-900 dark:text-white mb-2">
                No comments yet
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Be the first to share your thoughts on this post!
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
