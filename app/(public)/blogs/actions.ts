"use server";

import { prisma } from "@/lib/prisma";
import { Prisma, Visibility } from "@prisma/client";

// Define blog post type
export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content?: string | null;
  author?: string | null;
  featuredImage?: string | null;
  publishedAt: Date | null;
  createdAt: Date;
};

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

// Function to get paginated blog posts for the public site
export async function getPublicBlogs(page: number = 1, limit: number = 10): Promise<PaginatedBlogs> {
  // Only show published blogs
  const where: Prisma.BlogPostWhereInput = {
    status: Visibility.PUBLISHED
  };

  // Count total blogs matching filters (published only)
  const total = await prisma.blogPost.count({ where });

  // Calculate pagination
  const pages = Math.ceil(total / limit);
  const currentPage = Math.min(page, pages) || 1;
  const skip = (currentPage - 1) * limit;

  // Fetch blogs with pagination
  const blogs = await prisma.blogPost.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      publishedAt: "desc", // Show newest blogs first
    },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      author: true,
      featuredImage: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  return {
    blogs,
    pagination: {
      page: currentPage,
      pages,
      total,
      limit,
    },
  };
}

// Function to get a single blog by slug
export async function getBlogBySlug(slug: string) {
  try {
    const blog = await prisma.blogPost.findUnique({
      where: {
        slug,
        status: Visibility.PUBLISHED, // Only fetch published blogs
      },
    });

    if (!blog) {
      return { success: false, error: "Blog not found" };
    }

    return { success: true, data: blog };
  } catch (error) {
    console.error("Error fetching blog:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}