import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft, Check, Info, PlusCircle } from "lucide-react";
import { getGalleryById, getGalleryMedia } from "../../actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MediaUploader } from "./components/media-uploader";
import { MediaGrid } from "./components/media-grid";
import { VisibilityStatus } from "@/db/schema";

interface MediaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Manage Gallery Media | DIU ACM Admin",
  description: "Upload and manage images for your gallery",
};

export default async function MediaPage({ params }: MediaPageProps) {
  const resolvedParams = await params;
  const galleryId = parseInt(resolvedParams.id);

  if (isNaN(galleryId)) {
    notFound();
  }

  // Get gallery info and media in parallel
  const [galleryResult, mediaResult] = await Promise.all([
    getGalleryById(galleryId),
    getGalleryMedia(galleryId),
  ]);

  if (!galleryResult.success || !galleryResult.data) {
    notFound();
  }

  if (!mediaResult.success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Gallery Media</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              {mediaResult.error || "Failed to load media"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const gallery = galleryResult.data;
  const media = mediaResult.data || [];
  const hasImages = media.length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/galleries">Galleries</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/admin/galleries/${galleryId}/edit`}>
                  {gallery.title}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-foreground font-medium">
                Media
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Gallery Media: {gallery.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Upload and manage images for this gallery
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/galleries/${galleryId}/edit`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Gallery
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
          <CardDescription>
            Upload multiple images to your gallery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MediaUploader galleryId={galleryId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Gallery Images</CardTitle>
            <CardDescription>
              {hasImages
                ? `${media.length} image${
                    media.length !== 1 ? "s" : ""
                  } in this gallery`
                : "No images yet"}
            </CardDescription>
          </div>
          {gallery.status === VisibilityStatus.PUBLISHED && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Check className="h-4 w-4 mr-1.5 text-green-600" />
              <span>Published gallery</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {!hasImages ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <div className="rounded-full bg-muted p-3">
                <PlusCircle className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No images</h3>
              <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                Get started by uploading your first image to this gallery.
              </p>
              <div className="text-center mt-2 text-sm bg-muted p-3 rounded-md">
                <Info className="h-4 w-4 inline mr-1" />
                <span>Drag and drop files in the upload area above.</span>
              </div>
            </div>
          ) : (
            <MediaGrid gallery={{ ...gallery, media }} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
