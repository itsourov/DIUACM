"use server";

import { db } from "@/db/drizzle";
import { blogPosts, VisibilityStatus, type BlogPost } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

// Define pagination structure
export type PaginatedBlogs = {
  blogs: BlogPost[];
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
};

// Function to get all public blogs without pagination
export async function getAllPublicBlogs(): Promise<BlogPost[]> {
  try {
    // Only show published blogs
    const blogs = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        author: blogPosts.author,
        content: blogPosts.content,
        status: blogPosts.status,
        featuredImage: blogPosts.featuredImage,
        publishedAt: blogPosts.publishedAt,
        isFeatured: blogPosts.isFeatured,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.status, VisibilityStatus.PUBLISHED))
      .orderBy(desc(blogPosts.publishedAt)); // Show newest blogs first

    return blogs;
  } catch (error) {
    console.error("Error fetching all public blogs:", error);
    return [];
  }
}

// Function to get a single blog by slug
export async function getBlogBySlug(slug: string) {
  try {
    const blog = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        author: blogPosts.author,
        content: blogPosts.content,
        status: blogPosts.status,
        featuredImage: blogPosts.featuredImage,
        publishedAt: blogPosts.publishedAt,
        isFeatured: blogPosts.isFeatured,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
      })
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.slug, slug),
          eq(blogPosts.status, VisibilityStatus.PUBLISHED)
        )
      )
      .limit(1);

    if (!blog || blog.length === 0) {
      return { success: false, error: "Blog not found" };
    }

    return { success: true, data: blog[0] };
  } catch (error) {
    console.error("Error fetching blog:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
