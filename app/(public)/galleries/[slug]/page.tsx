import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Images } from "lucide-react";
import { getGalleryBySlug } from "../actions";
import { GalleryGrid } from "./components/gallery-grid";
// import { db } from "@/db/drizzle";
// import { galleries, VisibilityStatus } from "@/db/schema";
// import { eq } from "drizzle-orm";

interface GalleryDetailPageProps {
  params: Promise<{ slug: string }>;
}
// export async function generateStaticParams() {
//   const allGalleries = await db
//     .select({
//       id: galleries.id,
//       slug: galleries.slug,
//       status: galleries.status,
//     })
//     .from(galleries)
//     .where(eq(galleries.status, VisibilityStatus.PUBLISHED));

//   return allGalleries.map((gallery) => ({
//     slug: gallery.slug,
//   }));
// }

export async function generateMetadata({
  params,
}: GalleryDetailPageProps): Promise<Metadata> {
  // Get resolved params
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  try {
    const { success, data: gallery } = await getGalleryBySlug(slug);

    if (!success || !gallery) {
      return {
        title: "Gallery Not Found",
        description: "The requested gallery could not be found.",
      };
    }

    return {
      title: `${gallery.title} | Photo Gallery`,
      description: gallery.description || `View photos from ${gallery.title}`,
      openGraph: gallery.media?.[0]
        ? {
            images: [
              {
                url: gallery.media[0].url,
                width: gallery.media[0].width,
                height: gallery.media[0].height,
                alt: gallery.title,
              },
            ],
          }
        : undefined,
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Gallery | DIU ACM",
      description: "View our photo gallery",
    };
  }
}

export default async function GalleryDetailPage({
  params,
}: GalleryDetailPageProps) {
  // Get resolved params
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Get gallery data
  const { success, data: gallery } = await getGalleryBySlug(slug);

  if (!success || !gallery) {
    notFound();
  }

  const hasImages = gallery.media.length > 0;

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
            {gallery.title}
          </span>
        </h1>
        <div className="mx-auto w-20 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mb-6"></div>
        {gallery.description && (
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto mb-4">
            {gallery.description}
          </p>
        )}
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <p className="flex items-center justify-center">
            <Images className="h-4 w-4 mr-1" />
            {gallery.media.length}{" "}
            {gallery.media.length === 1 ? "photo" : "photos"} in this gallery
          </p>
        </div>
      </div>

      {/* Photo grid */}
      {hasImages ? (
        <GalleryGrid media={gallery.media} galleryTitle={gallery.title} />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-8 md:p-16 text-center transition-all duration-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
            <Images className="h-8 w-8 text-slate-500 dark:text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No images in this gallery
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            This gallery does not contain any images yet.
          </p>
        </div>
      )}
    </div>
  );
}
