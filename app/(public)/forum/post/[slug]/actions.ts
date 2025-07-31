"use server";

import { z } from "zod";
import { db } from "@/db/drizzle";
import {
  forumPosts,
  forumCategories,
  forumComments,
  forumCommentVotes,
  forumPostVotes,
  users,
  ForumPostWithDetails,
  ForumCommentWithAuthor,
  VoteType,
} from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

// Get a single forum post by slug
export async function getForumPost(
  slug: string
): Promise<ForumPostWithDetails> {
  const session = await auth();
  const userId = session?.user?.id;

  let baseQuery = db
    .select({
      // Forum post fields
      id: forumPosts.id,
      title: forumPosts.title,
      content: forumPosts.content,
      slug: forumPosts.slug,
      authorId: forumPosts.authorId,
      categoryId: forumPosts.categoryId,
      isPinned: forumPosts.isPinned,
      isLocked: forumPosts.isLocked,
      status: forumPosts.status,
      upvotes: forumPosts.upvotes,
      downvotes: forumPosts.downvotes,
      commentCount: forumPosts.commentCount,
      lastActivityAt: forumPosts.lastActivityAt,
      createdAt: forumPosts.createdAt,
      updatedAt: forumPosts.updatedAt,
      // Author fields
      authorName: users.name,
      authorUsername: users.username,
      authorImage: users.image,
      // Category fields
      categoryName: forumCategories.name,
      categorySlug: forumCategories.slug,
      categoryColor: forumCategories.color,
      // User vote if logged in
      userVoteType: userId ? forumPostVotes.voteType : sql`NULL`,
    })
    .from(forumPosts)
    .leftJoin(users, eq(forumPosts.authorId, users.id))
    .leftJoin(forumCategories, eq(forumPosts.categoryId, forumCategories.id));

  // Only add the vote join if user is logged in
  if (userId) {
    baseQuery = baseQuery.leftJoin(
      forumPostVotes,
      and(
        eq(forumPostVotes.postId, forumPosts.id),
        eq(forumPostVotes.userId, userId)
      )
    );
  }

  const result = await baseQuery
    .where(and(eq(forumPosts.slug, slug), eq(forumPosts.status, "published")))
    .limit(1);

  if (!result[0]) {
    notFound();
  }

  const post = result[0];

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    slug: post.slug,
    authorId: post.authorId,
    categoryId: post.categoryId,
    isPinned: post.isPinned,
    isLocked: post.isLocked,
    status: post.status,
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    commentCount: post.commentCount,
    lastActivityAt: post.lastActivityAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: {
      id: post.authorId,
      name: post.authorName || "Unknown User",
      username: post.authorUsername || "unknown",
      image: post.authorImage,
    },
    category: {
      id: post.categoryId,
      name: post.categoryName || "General",
      slug: post.categorySlug || "general",
      color: post.categoryColor || "#6B7280",
    },
    userVote: post.userVoteType
      ? { voteType: post.userVoteType as VoteType }
      : null,
    _count: {
      comments: post.commentCount,
    },
  };
}

// Get comments for a forum post with nested replies
export async function getForumComments(
  postId: number
): Promise<ForumCommentWithAuthor[]> {
  const session = await auth();
  const userId = session?.user?.id;

  // Build the base query
  let baseQuery = db
    .select({
      id: forumComments.id,
      content: forumComments.content,
      authorId: forumComments.authorId,
      postId: forumComments.postId,
      parentId: forumComments.parentId,
      upvotes: forumComments.upvotes,
      downvotes: forumComments.downvotes,
      isDeleted: forumComments.isDeleted,
      createdAt: forumComments.createdAt,
      updatedAt: forumComments.updatedAt,
      // Author fields
      authorName: users.name,
      authorUsername: users.username,
      authorImage: users.image,
      // User vote if logged in
      userVoteType: userId ? forumCommentVotes.voteType : sql`NULL`,
    })
    .from(forumComments)
    .leftJoin(users, eq(forumComments.authorId, users.id));

  // Only add the vote join if user is logged in
  if (userId) {
    baseQuery = baseQuery.leftJoin(
      forumCommentVotes,
      and(
        eq(forumCommentVotes.commentId, forumComments.id),
        eq(forumCommentVotes.userId, userId)
      )
    );
  }

  // Get all comments for the post
  const allComments = await baseQuery
    .where(
      and(eq(forumComments.postId, postId), eq(forumComments.isDeleted, false))
    )
    .orderBy(asc(forumComments.createdAt));

  // Format comments and build nested structure
  const commentMap = new Map<number, ForumCommentWithAuthor>();
  const rootComments: ForumCommentWithAuthor[] = [];

  // First pass: create all comment objects
  allComments.forEach((comment) => {
    const formattedComment: ForumCommentWithAuthor = {
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      postId: comment.postId,
      parentId: comment.parentId,
      upvotes: comment.upvotes,
      downvotes: comment.downvotes,
      isDeleted: comment.isDeleted,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: comment.authorId,
        name: comment.authorName || "Unknown User",
        username: comment.authorUsername || "unknown",
        image: comment.authorImage,
      },
      userVote: comment.userVoteType
        ? { voteType: comment.userVoteType as VoteType }
        : null,
      replies: [],
    };

    commentMap.set(comment.id, formattedComment);
  });

  // Second pass: build the nested structure
  commentMap.forEach((comment) => {
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  return rootComments;
}

// Create a new comment
const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(2000, "Comment is too long"),
  postId: z.number(),
  parentId: z.number().optional(),
});

export async function createComment(data: z.infer<typeof createCommentSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to comment");
  }

  const validatedData = createCommentSchema.parse(data);
  const userId = session.user.id;

  try {
    // Check if the post exists and is not locked
    const post = await db
      .select({
        id: forumPosts.id,
        isLocked: forumPosts.isLocked,
        slug: forumPosts.slug,
      })
      .from(forumPosts)
      .where(eq(forumPosts.id, validatedData.postId))
      .limit(1);

    if (!post[0]) {
      throw new Error("Post not found");
    }

    if (post[0].isLocked) {
      throw new Error("This post is locked and cannot be commented on");
    }

    // If replying to a comment, check if parent comment exists
    if (validatedData.parentId) {
      const parentComment = await db
        .select({ id: forumComments.id })
        .from(forumComments)
        .where(
          and(
            eq(forumComments.id, validatedData.parentId),
            eq(forumComments.postId, validatedData.postId),
            eq(forumComments.isDeleted, false)
          )
        )
        .limit(1);

      if (!parentComment[0]) {
        throw new Error("Parent comment not found");
      }
    }

    // Create the comment
    await db.insert(forumComments).values({
      content: validatedData.content,
      authorId: userId,
      postId: validatedData.postId,
      parentId: validatedData.parentId,
    });

    // Update the post's comment count and last activity
    await db
      .update(forumPosts)
      .set({
        commentCount: sql`${forumPosts.commentCount} + 1`,
        lastActivityAt: new Date(),
      })
      .where(eq(forumPosts.id, validatedData.postId));

    revalidatePath(`/forum/post/${post[0].slug}`);
    return { success: true };
  } catch (error) {
    console.error("Error creating comment:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create comment"
    );
  }
}

// Vote on a comment
export async function voteOnComment(commentId: number, voteType: VoteType) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to vote");
  }

  const userId = session.user.id;

  try {
    // Check if user has already voted on this comment
    const existingVote = await db
      .select()
      .from(forumCommentVotes)
      .where(
        and(
          eq(forumCommentVotes.commentId, commentId),
          eq(forumCommentVotes.userId, userId)
        )
      )
      .limit(1);

    const currentVote = existingVote[0];

    if (currentVote) {
      if (currentVote.voteType === voteType) {
        // User is removing their vote
        await db
          .delete(forumCommentVotes)
          .where(
            and(
              eq(forumCommentVotes.commentId, commentId),
              eq(forumCommentVotes.userId, userId)
            )
          );

        // Update comment vote counts
        await db
          .update(forumComments)
          .set({
            upvotes: sql`${forumComments.upvotes} - ${
              voteType === "upvote" ? 1 : 0
            }`,
            downvotes: sql`${forumComments.downvotes} - ${
              voteType === "downvote" ? 1 : 0
            }`,
          })
          .where(eq(forumComments.id, commentId));
      } else {
        // User is changing their vote
        await db
          .update(forumCommentVotes)
          .set({ voteType, updatedAt: new Date() })
          .where(
            and(
              eq(forumCommentVotes.commentId, commentId),
              eq(forumCommentVotes.userId, userId)
            )
          );

        // Update comment vote counts (remove old vote, add new vote)
        if (currentVote.voteType === "upvote" && voteType === "downvote") {
          await db
            .update(forumComments)
            .set({
              upvotes: sql`${forumComments.upvotes} - 1`,
              downvotes: sql`${forumComments.downvotes} + 1`,
            })
            .where(eq(forumComments.id, commentId));
        } else if (
          currentVote.voteType === "downvote" &&
          voteType === "upvote"
        ) {
          await db
            .update(forumComments)
            .set({
              upvotes: sql`${forumComments.upvotes} + 1`,
              downvotes: sql`${forumComments.downvotes} - 1`,
            })
            .where(eq(forumComments.id, commentId));
        }
      }
    } else {
      // User is voting for the first time
      await db.insert(forumCommentVotes).values({
        userId,
        commentId,
        voteType,
      });

      // Update comment vote counts
      await db
        .update(forumComments)
        .set({
          upvotes: sql`${forumComments.upvotes} + ${
            voteType === "upvote" ? 1 : 0
          }`,
          downvotes: sql`${forumComments.downvotes} + ${
            voteType === "downvote" ? 1 : 0
          }`,
        })
        .where(eq(forumComments.id, commentId));
    }

    // Get the post slug for revalidation
    const comment = await db
      .select({
        postSlug: forumPosts.slug,
      })
      .from(forumComments)
      .leftJoin(forumPosts, eq(forumComments.postId, forumPosts.id))
      .where(eq(forumComments.id, commentId))
      .limit(1);

    if (comment[0]?.postSlug) {
      revalidatePath(`/forum/post/${comment[0].postSlug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error voting on comment:", error);
    throw new Error("Failed to vote on comment");
  }
}
