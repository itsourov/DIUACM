"use server";

import { z } from "zod";
import { db } from "@/db/drizzle";
import {
  forumPosts,
  forumCategories,
  forumPostVotes,
  users,
  ForumPostWithDetails,
  VoteType,
} from "@/db/schema";
import { eq, and, ilike, count, desc, asc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Define pagination structure
export type PaginatedForumPosts = {
  posts: ForumPostWithDetails[];
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
};

// Define filters schema for type safety
const forumFiltersSchema = z.object({
  categoryId: z.string().optional(),
  sortBy: z.enum(["latest", "popular", "trending"]).default("latest"),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(15),
  search: z.string().optional(),
});

// Function to get forum posts with pagination and filtering
export async function getForumPosts(
  filters: z.infer<typeof forumFiltersSchema>
): Promise<PaginatedForumPosts> {
  const session = await auth();
  const userId = session?.user?.id;

  // Validate filters
  const validatedFilters = forumFiltersSchema.parse(filters);

  // Build where conditions
  const whereConditions = [];

  // Only fetch published posts
  whereConditions.push(eq(forumPosts.status, "published"));

  // Filter by category
  if (validatedFilters.categoryId) {
    whereConditions.push(
      eq(forumPosts.categoryId, parseInt(validatedFilters.categoryId))
    );
  }

  // Filter by search term
  if (validatedFilters.search) {
    whereConditions.push(
      ilike(forumPosts.title, `%${validatedFilters.search}%`)
    );
  }

  // Combine all conditions with AND
  const whereClause =
    whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0];

  // Count total posts matching filters
  const totalResult = await db
    .select({ count: count() })
    .from(forumPosts)
    .where(whereClause);
  const total = totalResult[0]?.count || 0;

  // Calculate pagination
  const limit = validatedFilters.limit;
  const pages = Math.ceil(total / limit);
  const page = Math.min(validatedFilters.page, pages) || 1;
  const offset = (page - 1) * limit;

  // Determine sort order
  let orderBy;
  switch (validatedFilters.sortBy) {
    case "popular":
      orderBy = desc(sql`${forumPosts.upvotes} - ${forumPosts.downvotes}`);
      break;
    case "trending":
      orderBy = desc(forumPosts.lastActivityAt);
      break;
    case "latest":
    default:
      orderBy = desc(forumPosts.createdAt);
      break;
  }

  // Build the main query
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

  const results = await baseQuery
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  // Format the results to match the expected type
  const formattedPosts: ForumPostWithDetails[] = results.map((result) => ({
    id: result.id,
    title: result.title,
    content: result.content,
    slug: result.slug,
    authorId: result.authorId,
    categoryId: result.categoryId,
    isPinned: result.isPinned,
    isLocked: result.isLocked,
    status: result.status,
    upvotes: result.upvotes,
    downvotes: result.downvotes,
    commentCount: result.commentCount,
    lastActivityAt: result.lastActivityAt,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    author: {
      id: result.authorId,
      name: result.authorName || "Unknown User",
      username: result.authorUsername || "unknown",
      image: result.authorImage,
    },
    category: {
      id: result.categoryId,
      name: result.categoryName || "General",
      slug: result.categorySlug || "general",
      color: result.categoryColor || "#6B7280",
    },
    userVote: result.userVoteType
      ? { voteType: result.userVoteType as VoteType }
      : null,
    _count: {
      comments: result.commentCount,
    },
  }));

  return {
    posts: formattedPosts,
    pagination: {
      page,
      pages,
      total,
      limit,
    },
  };
}

// Function to get forum categories for filtering
export async function getForumCategories() {
  const categories = await db
    .select({
      id: forumCategories.id,
      name: forumCategories.name,
      slug: forumCategories.slug,
      color: forumCategories.color,
      description: forumCategories.description,
      postCount: count(forumPosts.id),
    })
    .from(forumCategories)
    .leftJoin(
      forumPosts,
      and(
        eq(forumCategories.id, forumPosts.categoryId),
        eq(forumPosts.status, "published")
      )
    )
    .where(eq(forumCategories.isActive, true))
    .groupBy(forumCategories.id)
    .orderBy(asc(forumCategories.order));

  return categories;
}

// Function to handle voting on forum posts
export async function voteOnPost(postId: number, voteType: VoteType) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to vote");
  }

  const userId = session.user.id;

  try {
    // Check if user has already voted on this post
    const existingVote = await db
      .select()
      .from(forumPostVotes)
      .where(
        and(
          eq(forumPostVotes.postId, postId),
          eq(forumPostVotes.userId, userId)
        )
      )
      .limit(1);

    const currentVote = existingVote[0];

    if (currentVote) {
      if (currentVote.voteType === voteType) {
        // User is removing their vote
        await db
          .delete(forumPostVotes)
          .where(
            and(
              eq(forumPostVotes.postId, postId),
              eq(forumPostVotes.userId, userId)
            )
          );

        // Update post vote counts
        await db
          .update(forumPosts)
          .set({
            upvotes: sql`${forumPosts.upvotes} - ${
              voteType === "upvote" ? 1 : 0
            }`,
            downvotes: sql`${forumPosts.downvotes} - ${
              voteType === "downvote" ? 1 : 0
            }`,
          })
          .where(eq(forumPosts.id, postId));
      } else {
        // User is changing their vote
        await db
          .update(forumPostVotes)
          .set({ voteType, updatedAt: new Date() })
          .where(
            and(
              eq(forumPostVotes.postId, postId),
              eq(forumPostVotes.userId, userId)
            )
          );

        // Update post vote counts (remove old vote, add new vote)
        if (currentVote.voteType === "upvote" && voteType === "downvote") {
          await db
            .update(forumPosts)
            .set({
              upvotes: sql`${forumPosts.upvotes} - 1`,
              downvotes: sql`${forumPosts.downvotes} + 1`,
            })
            .where(eq(forumPosts.id, postId));
        } else if (
          currentVote.voteType === "downvote" &&
          voteType === "upvote"
        ) {
          await db
            .update(forumPosts)
            .set({
              upvotes: sql`${forumPosts.upvotes} + 1`,
              downvotes: sql`${forumPosts.downvotes} - 1`,
            })
            .where(eq(forumPosts.id, postId));
        }
      }
    } else {
      // User is voting for the first time
      await db.insert(forumPostVotes).values({
        userId,
        postId,
        voteType,
      });

      // Update post vote counts
      await db
        .update(forumPosts)
        .set({
          upvotes: sql`${forumPosts.upvotes} + ${
            voteType === "upvote" ? 1 : 0
          }`,
          downvotes: sql`${forumPosts.downvotes} + ${
            voteType === "downvote" ? 1 : 0
          }`,
        })
        .where(eq(forumPosts.id, postId));
    }

    revalidatePath("/forum");
    return { success: true };
  } catch (error) {
    console.error("Error voting on post:", error);
    throw new Error("Failed to vote on post");
  }
}

// Schema for creating a new forum post
const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(10000, "Content too long"),
  categoryId: z.number().int().positive("Please select a category"),
});

// Function to create a new forum post
export async function createForumPost(
  data: z.infer<typeof createPostSchema>
): Promise<{ success: boolean; slug?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a post");
  }

  // Validate the input data
  const validatedData = createPostSchema.parse(data);

  // Generate a slug from the title
  const baseSlug = validatedData.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Ensure slug is unique by checking existing posts
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db
      .select({ id: forumPosts.id })
      .from(forumPosts)
      .where(eq(forumPosts.slug, slug))
      .limit(1);

    if (existing.length === 0) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  try {
    // Create the post
    const [newPost] = await db
      .insert(forumPosts)
      .values({
        title: validatedData.title,
        content: validatedData.content,
        slug: slug,
        authorId: session.user.id,
        categoryId: validatedData.categoryId,
        status: "published",
        isPinned: false,
        isLocked: false,
        upvotes: 0,
        downvotes: 0,
        commentCount: 0,
        lastActivityAt: new Date(),
      })
      .returning({ id: forumPosts.id, slug: forumPosts.slug });

    // Revalidate forum pages
    revalidatePath("/forum");
    revalidatePath(`/forum/post/${slug}`);

    return { success: true, slug: newPost.slug };
  } catch (error) {
    console.error("Error creating forum post:", error);
    throw new Error("Failed to create post");
  }
}
