import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Images } from "lucide-react";
import { getGalleryById } from "../../actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { GalleryForm } from "../../components/gallery-form";

interface EditGalleryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Edit Gallery | DIU ACM Admin",
  description: "Edit gallery details",
};

export default async function EditGalleryPage({
  params,
}: EditGalleryPageProps) {
  const resolvedParams = await params;
  const galleryId = parseInt(resolvedParams.id);

  if (isNaN(galleryId)) {
    notFound();
  }

  const result = await getGalleryById(galleryId);

  if (!result.success || !result.data) {
    notFound();
  }

  const gallery = result.data;

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
              <BreadcrumbLink className="text-foreground font-medium">
                Edit Gallery
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Gallery</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Update gallery details and settings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/galleries/${galleryId}/media`}>
                <Images className="mr-2 h-4 w-4" />
                Manage Media
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <GalleryForm initialData={gallery} isEditing={true} />
    </div>
  );
}
