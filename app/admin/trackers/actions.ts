"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { trackerFormSchema, type TrackerFormValues } from "./schemas/tracker";

export async function createTracker(values: TrackerFormValues) {
  try {
    const validatedFields = trackerFormSchema.parse(values);
    
    // Check if slug is already taken
    const existingTracker = await prisma.tracker.findUnique({
      where: { slug: validatedFields.slug }
    });

    if (existingTracker) {
      return { 
        success: false, 
        error: { slug: ["This slug is already in use."] } 
      };
    }
    
    const tracker = await prisma.tracker.create({
      data: validatedFields,
    });

    revalidatePath("/admin/trackers");
    return { success: true, data: tracker };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }
    
    return { 
      success: false, 
      error: "Something went wrong. Please try again." 
    };
  }
}

export async function updateTracker(
  id: string,
  values: TrackerFormValues
) {
  try {
    const validatedFields = trackerFormSchema.parse(values);
    
    // Check if slug is already taken by another tracker
    const existingTracker = await prisma.tracker.findUnique({
      where: { slug: validatedFields.slug }
    });

    if (existingTracker && existingTracker.id !== id) {
      return { 
        success: false, 
        error: { slug: ["This slug is already in use."] } 
      };
    }
    
    const tracker = await prisma.tracker.update({
      where: { id },
      data: validatedFields,
    });

    revalidatePath("/admin/trackers");
    revalidatePath(`/admin/trackers/${id}/edit`);
    return { success: true, data: tracker };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }
    
    return { 
      success: false, 
      error: "Something went wrong. Please try again." 
    };
  }
}

export async function deleteTracker(id: string) {
  try {
    await prisma.tracker.delete({
      where: { id },
    });

    revalidatePath("/admin/trackers");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { 
      success: false, 
      error: "Something went wrong. Please try again." 
    };
  }
}

export async function getTracker(id: string) {
  try {
    const tracker = await prisma.tracker.findUnique({
      where: { id },
    });

    if (!tracker) {
      return { success: false, error: "Tracker not found" };
    }

    return { success: true, data: tracker };
  } catch (error) {
    console.error(error);
    return { 
      success: false, 
      error: "Something went wrong. Please try again." 
    };
  }
}

export async function getPaginatedTrackers(
  page: number = 1, 
  pageSize: number = 10, 
  search?: string
) {
  try {
    const skip = (page - 1) * pageSize;
    
    const where: Prisma.TrackerWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { slug: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};
    
    const [trackers, totalCount] = await Promise.all([
      prisma.tracker.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              rankLists: true
            }
          }
        }
      }),
      prisma.tracker.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);
    
    return { 
      success: true, 
      data: { 
        trackers, 
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          pageSize,
        }
      } 
    };
  } catch (error) {
    console.error(error);
    return { 
      success: false, 
      error: "Something went wrong. Please try again." 
    };
  }
}