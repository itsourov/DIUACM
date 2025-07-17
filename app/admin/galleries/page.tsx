import Link from "next/link";
import { BadgeInfo, Plus, ImageIcon, Tag, Pencil, Images } from "lucide-react";
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
import { getPaginatedGalleries, deleteGallery } from "./actions";
import { DeleteButton } from "../components/delete-button";
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
  const awaitedSearchParams = await searchParams;
  const page = parseInt(awaitedSearchParams.page ?? "1", 10);
  const search = awaitedSearchParams.search || undefined;

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

  const galleries = result.data?.galleries ?? [];
  const pagination = result.data?.pagination ?? {
    page: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default">Published</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "private":
        return <Badge variant="secondary">Private</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
              Manage photo galleries for your organization
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/galleries/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Gallery
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-xl">Galleries List</CardTitle>
            <CardDescription>
              Total: {pagination.totalCount} gallery
              {pagination.totalCount !== 1 ? "ies" : ""}
            </CardDescription>
          </div>
          <SearchGalleries />
        </CardHeader>
        <CardContent>
          {galleries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <div className="rounded-full bg-muted p-3">
                <ImageIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No galleries found</h3>
              {search ? (
                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  No galleries match &quot;{search}&quot;. Try a different
                  search term or create a new gallery.
                </p>
              ) : (
                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  Get started by creating your first gallery.
                </p>
              )}
              <Button asChild variant="outline" className="mt-2">
                <Link href="/admin/galleries/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Gallery
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[220px]">
                        Gallery Details
                      </TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Media Count</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {galleries.map((gallery) => (
                      <TableRow key={gallery.id}>
                        <TableCell>
                          <div className="space-y-1.5">
                            <div className="font-medium text-base">
                              {gallery.title}
                            </div>
                            {gallery.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                                {gallery.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Tag className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span className="text-sm">{gallery.slug}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(gallery.status)}</TableCell>
                        <TableCell>
                          <span className="text-sm">{gallery.order}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <BadgeInfo className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span className="text-sm">
                              {gallery._count?.media || 0} image
                              {(gallery._count?.media || 0) !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  asChild
                                >
                                  <Link
                                    href={`/admin/galleries/${gallery.id}/edit`}
                                    className="flex items-center justify-center"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Gallery</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  asChild
                                >
                                  <Link
                                    href={`/admin/galleries/${gallery.id}/media`}
                                    className="flex items-center justify-center"
                                  >
                                    <Images className="h-4 w-4" />
                                    <span className="sr-only">
                                      Manage Media
                                    </span>
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Manage Media</TooltipContent>
                            </Tooltip>

                            <DeleteButton
                              id={gallery.id}
                              itemName={gallery.title}
                              itemType="Gallery"
                              onDelete={deleteGallery}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-6 flex justify-center">
                <CustomPagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
