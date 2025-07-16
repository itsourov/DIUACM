import Link from "next/link";
import { Plus, ImageIcon, Tag, Pencil, Images } from "lucide-react";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CustomPagination } from "@/components/custom-pagination";
import { getPaginatedGalleries } from "./actions";
import { DeleteGalleryButton } from "./components/delete-gallery-button";
import { SearchGalleries } from "./components/search-galleries";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Galleries Management | DIU ACM Admin",
  description: "Manage all your photo galleries in one place",
};

interface GalleriesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function GalleriesPage({
  searchParams,
}: GalleriesPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search;

  const result = await getPaginatedGalleries(page, search);

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Galleries</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              {result.error || "Failed to load galleries"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { galleries, pagination } = result.data!;

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
              <BreadcrumbLink className="text-foreground font-medium">
                Galleries
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Galleries</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your photo galleries and media collections
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/galleries/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Gallery
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Images className="h-5 w-5" />
                All Galleries
              </CardTitle>
              <CardDescription>
                {pagination.totalCount} galleries found
                {search && ` for "${search}"`}
              </CardDescription>
            </div>
            <SearchGalleries />
          </div>
        </CardHeader>
        <CardContent>
          {galleries.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No galleries found</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                {search
                  ? `No galleries match your search for "${search}"`
                  : "You haven't created any galleries yet. Create your first gallery to get started."}
              </p>
              {!search && (
                <Button asChild className="mt-4">
                  <Link href="/admin/galleries/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Gallery
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gallery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Media Count</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {galleries.map((gallery) => (
                    <TableRow key={gallery.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{gallery.title}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {gallery.slug}
                          </div>
                          {gallery.description && (
                            <div className="text-sm text-muted-foreground">
                              {gallery.description.length > 100
                                ? gallery.description.substring(0, 40) + "..."
                                : gallery.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            gallery.status === "published"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {gallery.status === "published"
                            ? "Published"
                            : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{gallery._count?.media || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{gallery.order}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {gallery.createdAt?.toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" asChild>
                                <Link
                                  href={`/admin/galleries/${gallery.id}/media`}
                                >
                                  <ImageIcon className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Manage Media</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" asChild>
                                <Link
                                  href={`/admin/galleries/${gallery.id}/edit`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Gallery</p>
                            </TooltipContent>
                          </Tooltip>

                          <DeleteGalleryButton
                            id={gallery.id}
                            title={gallery.title}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination.totalPages > 1 && (
                <div className="mt-6">
                  <CustomPagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
