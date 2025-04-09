"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { blogFormSchema, type BlogFormValues } from "./schemas/blog";

// Create a new blog post
export async function createBlog(values: BlogFormValues) {
  try {
    const validatedFields = blogFormSchema.parse(values);

    // Check for duplicate slug
    const existingPost = await prisma.blogPost.findFirst({
      where: { slug: validatedFields.slug },
    });

    if (existingPost) {
      return {
        success: false,
        error:
          "A blog post with this slug already exists. Please choose a different slug.",
      };
    }

    const blogPost = await prisma.blogPost.create({
      data: validatedFields,
    });

    revalidatePath("/admin/blogs");
    return { success: true, data: blogPost };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }

    console.error("Error creating blog post:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Update an existing blog post
export async function updateBlog(id: string, values: BlogFormValues) {
  try {
    const validatedFields = blogFormSchema.parse(values);

    // Check if the slug is already in use by another post
    const existingPost = await prisma.blogPost.findFirst({
      where: {
        slug: validatedFields.slug,
        NOT: { id },
      },
    });

    if (existingPost) {
      return {
        success: false,
        error:
          "A blog post with this slug already exists. Please choose a different slug.",
      };
    }

    const blogPost = await prisma.blogPost.update({
      where: { id },
      data: validatedFields,
    });

    revalidatePath("/admin/blogs");
    revalidatePath(`/admin/blogs/${id}/edit`);
    revalidatePath(`/blog/${validatedFields.slug}`);
    return { success: true, data: blogPost };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }

    console.error("Error updating blog post:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Delete a blog post
export async function deleteBlog(id: string) {
  try {
    await prisma.blogPost.delete({
      where: { id },
    });

    revalidatePath("/admin/blogs");
    return { success: true };
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Get a single blog post by ID
export async function getBlog(id: string) {
  try {
    const blog = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!blog) {
      return { success: false, error: "Blog post not found" };
    }

    return { success: true, data: blog };
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Get paginated blog posts with optional filtering
export async function getPaginatedBlogs(
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  status?: string
) {
  try {
    const skip = (page - 1) * pageSize;

    // Build where conditions
    const where: Prisma.BlogPostWhereInput = {};

    // Add search filter if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { content: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { author: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    // Add status filter if provided
    if (status && status !== "ALL") {
      where.status = status as Prisma.EnumVisibilityFilter;
    }

    // Execute the queries
    const [blogs, totalCount] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      }),
      prisma.blogPost.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          pageSize,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
