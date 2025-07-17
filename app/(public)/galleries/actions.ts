"use server";

import { db } from "@/db/drizzle";
import { galleries, media, VisibilityStatus } from "@/db/schema";
import { eq, and, sql, asc, desc } from "drizzle-orm";

// Define gallery type with media
export type GalleryWithMedia = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  status: typeof VisibilityStatus.PUBLISHED | typeof VisibilityStatus.DRAFT;
  order: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  _count: {
    media: number;
  };
  media: Array<{
    id: number;
    url: string;
    title?: string | null;
    width: number;
    height: number;
  }>;
};

// Function to get all public galleries without pagination
export async function getPublicGalleries(): Promise<GalleryWithMedia[]> {
  try {
    // Get all published galleries with at least one media item
    const galleryData = await db
      .select({
        id: galleries.id,
        title: galleries.title,
        slug: galleries.slug,
        description: galleries.description,
        status: galleries.status,
        order: galleries.order,
        createdAt: galleries.createdAt,
        updatedAt: galleries.updatedAt,
      })
      .from(galleries)
      .where(
        and(
          eq(galleries.status, VisibilityStatus.PUBLISHED),
          // Check if gallery has at least one media item
          sql`EXISTS (SELECT 1 FROM ${media} WHERE ${media.galleryId} = ${galleries.id})`
        )
      )
      .orderBy(asc(galleries.order), desc(galleries.createdAt));

    // Get media for each gallery
    const result: GalleryWithMedia[] = await Promise.all(
      galleryData.map(async (gallery) => {
        const [mediaItems, mediaCount] = await Promise.all([
          db
            .select({
              id: media.id,
              url: media.url,
              title: media.title,
              width: media.width,
              height: media.height,
            })
            .from(media)
            .where(eq(media.galleryId, gallery.id))
            .orderBy(asc(media.order))
            .limit(1),
          db
            .select({ count: sql<number>`COUNT(*)` })
            .from(media)
            .where(eq(media.galleryId, gallery.id))
            .then((res) => res[0].count),
        ]);

        return {
          ...gallery,
          _count: { media: mediaCount },
          media: mediaItems,
        };
      })
    );

    return result;
  } catch (error) {
    console.error("Error fetching public galleries:", error);
    return [];
  }
}

// Function to get a single gallery by slug with all its media
export async function getGalleryBySlug(slug: string) {
  try {
    const galleryData = await db
      .select({
        id: galleries.id,
        title: galleries.title,
        slug: galleries.slug,
        description: galleries.description,
        status: galleries.status,
        order: galleries.order,
        createdAt: galleries.createdAt,
        updatedAt: galleries.updatedAt,
      })
      .from(galleries)
      .where(
        and(
          eq(galleries.slug, slug),
          eq(galleries.status, VisibilityStatus.PUBLISHED)
        )
      )
      .limit(1);

    if (!galleryData.length) {
      return { success: false, error: "Gallery not found" };
    }

    const gallery = galleryData[0];

    // Get all media for this gallery
    const mediaItems = await db
      .select({
        id: media.id,
        url: media.url,
        title: media.title,
        width: media.width,
        height: media.height,
        mimeType: media.mimeType,
        fileSize: media.fileSize,
      })
      .from(media)
      .where(eq(media.galleryId, gallery.id))
      .orderBy(asc(media.order));

    const result = {
      ...gallery,
      media: mediaItems,
    };

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching gallery by slug:", error);
    return { success: false, error: "Failed to fetch gallery" };
  }
}
