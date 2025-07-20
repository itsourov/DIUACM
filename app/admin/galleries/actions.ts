"use server";

import { db } from "@/db/drizzle";
import { galleries, media, type Gallery, type Media } from "@/db/schema";
// z import removed - validation handled by galleryFormSchema
import { revalidatePath } from "next/cache";
import { eq, or, like, count, desc, asc, sql } from "drizzle-orm";
import { galleryFormSchema, type GalleryFormValues } from "./schemas/gallery";
import { hasPermission } from "@/lib/authorization";
import { s3 } from "@/lib/s3";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Enhanced error handling type
type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Gallery data type with count using DB schema types
type GalleryData = Gallery & {
  _count?: {
    media: number;
  };
};

// Utility function to handle database errors
function handleDbError(error: unknown): ActionResult {
  console.error("Database error:", error);

  if (error instanceof Error) {
    // Handle specific database constraint errors
    if (error.message.includes("Duplicate entry")) {
      return {
        success: false,
        error: "A gallery with this slug already exists",
      };
    }
    if (error.message.includes("foreign key constraint")) {
      return { success: false, error: "Invalid reference" };
    }
    return { success: false, error: error.message };
  }

  return { success: false, error: "An unexpected error occurred" };
}

// Generate pre-signed URL for image upload
export async function generatePresignedUrl(
  galleryId: number,
  fileType: string,
  fileSize: number
): Promise<ActionResult<{ presignedUrl: string; key: string }>> {
  try {
    // Check if the user has permission to manage galleries
    if (!(await hasPermission("GALLERIES:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate mime type
    if (!fileType.startsWith("image/")) {
      return { success: false, error: "Only image files are allowed" };
    }

    // Validate file size on the server
    if (fileSize > MAX_FILE_SIZE) {
      return { success: false, error: "File size exceeds the 5MB limit" };
    }

    const fileExtension = fileType.split("/")[1];
    const uniqueId = uuid();
    const key = `gallery-images/${galleryId}/${uniqueId}.${fileExtension}`;

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    const presignedUrl = await getSignedUrl(s3, putObjectCommand, {
      expiresIn: 300, // 5 minutes
    });

    return {
      success: true,
      data: { presignedUrl, key },
    };
  } catch (error) {
    return handleDbError(error) as ActionResult<{
      presignedUrl: string;
      key: string;
    }>;
  }
}

// Save media data after successful upload
export async function saveMediaData(
  galleryId: number,
  mediaData: {
    title?: string;
    key: string;
    url: string;
    mimeType: string;
    fileSize: number;
    width: number;
    height: number;
  }
): Promise<ActionResult> {
  try {
    // Check if the user has permission to manage galleries
    if (!(await hasPermission("GALLERIES:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Get the current order for the gallery
    const maxOrderResult = await db
      .select({ maxOrder: sql<number>`COALESCE(MAX(${media.order}), -1)` })
      .from(media)
      .where(eq(media.galleryId, galleryId));

    const nextOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1;

    // Insert media record
    await db.insert(media).values({
      galleryId: galleryId,
      title: mediaData.title || null,
      url: mediaData.url,
      key: mediaData.key,
      mimeType: mediaData.mimeType,
      fileSize: mediaData.fileSize,
      width: mediaData.width,
      height: mediaData.height,
      order: nextOrder,
    });

    revalidatePath(`/admin/galleries/${galleryId}/media`);
    return { success: true, message: "Media uploaded successfully" };
  } catch (error) {
    return handleDbError(error);
  }
}

// Delete media
export async function deleteMedia(mediaId: number): Promise<ActionResult> {
  try {
    // Check if the user has permission to manage galleries
    if (!(await hasPermission("GALLERIES:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Get media data first
    const mediaItem = await db
      .select()
      .from(media)
      .where(eq(media.id, mediaId))
      .limit(1);

    if (mediaItem.length === 0) {
      return { success: false, error: "Media not found" };
    }

    const mediaData = mediaItem[0];

    // Delete from S3
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: mediaData.key,
    });

    await s3.send(deleteObjectCommand);

    // Delete from database
    await db.delete(media).where(eq(media.id, mediaId));

    revalidatePath(`/admin/galleries/${mediaData.galleryId}/media`);
    return { success: true, message: "Media deleted successfully" };
  } catch (error) {
    return handleDbError(error);
  }
}

// Get paginated galleries with search functionality
export async function getPaginatedGalleries(
  page = 1,
  search?: string
): Promise<
  ActionResult<{
    galleries: GalleryData[];
    pagination: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    };
  }>
> {
  try {
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const whereConditions = search
      ? or(
          like(galleries.title, `%${search}%`),
          like(galleries.slug, `%${search}%`),
          like(galleries.description, `%${search}%`)
        )
      : undefined;

    // Get total count
    const totalCountResult = await db
      .select({ count: count() })
      .from(galleries)
      .where(whereConditions);

    const totalCount = totalCountResult[0]?.count ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Get galleries with media count
    const galleriesResult = await db
      .select({
        id: galleries.id,
        title: galleries.title,
        slug: galleries.slug,
        description: galleries.description,
        status: galleries.status,
        order: galleries.order,
        createdAt: galleries.createdAt,
        updatedAt: galleries.updatedAt,
        mediaCount: sql<number>`COUNT(${media.id})`,
      })
      .from(galleries)
      .leftJoin(media, eq(galleries.id, media.galleryId))
      .where(whereConditions)
      .groupBy(galleries.id)
      .orderBy(desc(galleries.createdAt))
      .limit(pageSize)
      .offset(offset);

    const galleriesData: GalleryData[] = galleriesResult.map((gallery) => ({
      id: gallery.id,
      title: gallery.title,
      slug: gallery.slug,
      description: gallery.description,
      status: gallery.status,
      order: gallery.order,
      createdAt: gallery.createdAt,
      updatedAt: gallery.updatedAt,
      _count: {
        media: gallery.mediaCount || 0,
      },
    }));

    return {
      success: true,
      data: {
        galleries: galleriesData,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
        },
      },
    };
  } catch (error) {
    return handleDbError(error) as ActionResult<{
      galleries: GalleryData[];
      pagination: {
        page: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
      };
    }>;
  }
}

// Get gallery by ID
export async function getGalleryById(
  id: number
): Promise<ActionResult<GalleryData>> {
  try {
    const gallery = await db
      .select()
      .from(galleries)
      .where(eq(galleries.id, id))
      .limit(1);

    if (gallery.length === 0) {
      return { success: false, error: "Gallery not found" };
    }

    return {
      success: true,
      data: gallery[0] as GalleryData,
    };
  } catch (error) {
    return handleDbError(error) as ActionResult<GalleryData>;
  }
}

// Create gallery
export async function createGallery(
  values: GalleryFormValues
): Promise<ActionResult<{ id: number }>> {
  try {
    // Check if the user has permission to manage galleries
    if (!(await hasPermission("GALLERIES:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedFields = galleryFormSchema.parse(values);

    // Check if slug is already taken
    const existingGallery = await db
      .select()
      .from(galleries)
      .where(eq(galleries.slug, validatedFields.slug))
      .limit(1);

    if (existingGallery.length > 0) {
      return {
        success: false,
        error: "A gallery with this slug already exists",
      };
    }

    // Insert gallery
    const result = await db
      .insert(galleries)
      .values({
        title: validatedFields.title,
        slug: validatedFields.slug,
        description: validatedFields.description || null,
        status: validatedFields.status,
        order: validatedFields.order,
      })
      .returning({ id: galleries.id });

    revalidatePath("/admin/galleries");

    return {
      success: true,
      data: { id: result[0].id },
      message: "Gallery created successfully",
    };
  } catch (error) {
    return handleDbError(error) as ActionResult<{ id: number }>;
  }
}

// Update gallery
export async function updateGallery(
  id: number,
  values: GalleryFormValues
): Promise<ActionResult> {
  try {
    // Check if the user has permission to manage galleries
    if (!(await hasPermission("GALLERIES:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedFields = galleryFormSchema.parse(values);

    // Check if gallery exists
    const existingGallery = await db
      .select()
      .from(galleries)
      .where(eq(galleries.id, id))
      .limit(1);

    if (existingGallery.length === 0) {
      return { success: false, error: "Gallery not found" };
    }

    // Check if slug is already taken by another gallery
    if (validatedFields.slug !== existingGallery[0].slug) {
      const slugCheck = await db
        .select()
        .from(galleries)
        .where(eq(galleries.slug, validatedFields.slug))
        .limit(1);

      if (slugCheck.length > 0) {
        return {
          success: false,
          error: "A gallery with this slug already exists",
        };
      }
    }

    // Update gallery
    await db
      .update(galleries)
      .set({
        title: validatedFields.title,
        slug: validatedFields.slug,
        description: validatedFields.description || null,
        status: validatedFields.status,
        order: validatedFields.order,
      })
      .where(eq(galleries.id, id));

    revalidatePath("/admin/galleries");
    revalidatePath(`/admin/galleries/${id}`);

    return {
      success: true,
      message: "Gallery updated successfully",
    };
  } catch (error) {
    return handleDbError(error);
  }
}

// Delete gallery
export async function deleteGallery(id: number): Promise<ActionResult> {
  try {
    // Check if the user has permission to manage galleries
    if (!(await hasPermission("GALLERIES:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if gallery exists
    const existingGallery = await db
      .select()
      .from(galleries)
      .where(eq(galleries.id, id))
      .limit(1);

    if (existingGallery.length === 0) {
      return { success: false, error: "Gallery not found" };
    }

    // Get all media for this gallery to delete from S3
    const galleryMedia = await db
      .select()
      .from(media)
      .where(eq(media.galleryId, id));

    // Delete all media files from S3
    for (const mediaItem of galleryMedia) {
      try {
        const deleteObjectCommand = new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: mediaItem.key,
        });
        await s3.send(deleteObjectCommand);
      } catch (s3Error) {
        console.error(`Failed to delete S3 object ${mediaItem.key}:`, s3Error);
        // Continue with deletion even if S3 delete fails
      }
    }

    // Delete gallery (media will be deleted due to cascade)
    await db.delete(galleries).where(eq(galleries.id, id));

    revalidatePath("/admin/galleries");

    return {
      success: true,
      message: "Gallery deleted successfully",
    };
  } catch (error) {
    return handleDbError(error);
  }
}

// Get gallery media
export async function getGalleryMedia(
  galleryId: number
): Promise<ActionResult<Media[]>> {
  try {
    const galleryMedia = await db
      .select()
      .from(media)
      .where(eq(media.galleryId, galleryId))
      .orderBy(asc(media.order));

    return {
      success: true,
      data: galleryMedia,
    };
  } catch (error) {
    return handleDbError(error) as ActionResult<Media[]>;
  }
}

// Update media order
export async function updateMediaOrder(
  mediaId: number,
  newOrder: number
): Promise<ActionResult> {
  try {
    // Check if the user has permission to manage galleries
    if (!(await hasPermission("GALLERIES:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(media)
      .set({ order: newOrder })
      .where(eq(media.id, mediaId));

    // Get gallery ID to revalidate
    const mediaItem = await db
      .select({ galleryId: media.galleryId })
      .from(media)
      .where(eq(media.id, mediaId))
      .limit(1);

    if (mediaItem.length > 0) {
      revalidatePath(`/admin/galleries/${mediaItem[0].galleryId}/media`);
    }

    return { success: true, message: "Media order updated successfully" };
  } catch (error) {
    return handleDbError(error);
  }
}

// Update media title
export async function updateMediaTitle(
  mediaId: number,
  title: string
): Promise<ActionResult> {
  try {
    // Check if the user has permission to manage galleries
    if (!(await hasPermission("GALLERIES:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(media)
      .set({ title: title || null })
      .where(eq(media.id, mediaId));

    // Get gallery ID to revalidate
    const mediaItem = await db
      .select({ galleryId: media.galleryId })
      .from(media)
      .where(eq(media.id, mediaId))
      .limit(1);

    if (mediaItem.length > 0) {
      revalidatePath(`/admin/galleries/${mediaItem[0].galleryId}/media`);
    }

    return { success: true, message: "Media title updated successfully" };
  } catch (error) {
    return handleDbError(error);
  }
}
