import Link from "next/link";
import {
  BadgeInfo,
  Plus,
  BookText,
  Tag,
  Pencil,
  ListChecks,
} from "lucide-react";
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
import { getPaginatedTrackers, deleteTracker } from "./actions";
import { DeleteButton } from "../components/delete-button";
import { SearchTrackers } from "./components/search-trackers";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Trackers Management | DIU ACM Admin",
  description: "Manage all your performance trackers in one place",
};

interface TrackersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

interface Tracker {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  order: number;
  _count: {
    rankLists: number;
  };
}

interface TrackersData {
  trackers: Tracker[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
}

export default async function TrackersPage({
  searchParams,
}: TrackersPageProps) {
  const awaitedSearchParams = await searchParams;
  const page = parseInt(awaitedSearchParams.page ?? "1", 10);
  const search = awaitedSearchParams.search || undefined;

  const { data } = await getPaginatedTrackers(page, 10, search);

  const trackers = (data as TrackersData)?.trackers ?? [];
  const pagination = (data as TrackersData)?.pagination ?? {
    currentPage: 1,
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
                Trackers
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trackers</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage performance tracking systems
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/trackers/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Tracker
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-xl">Trackers List</CardTitle>
            <CardDescription>
              Total: {pagination.totalCount} tracker
              {pagination.totalCount !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <SearchTrackers />
        </CardHeader>
        <CardContent>
          {trackers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <div className="rounded-full bg-muted p-3">
                <BookText className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No trackers found</h3>
              {search ? (
                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  No trackers match &quot;{search}&quot;. Try a different search
                  term or create a new tracker.
                </p>
              ) : (
                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  Get started by creating your first tracker.
                </p>
              )}
              <Button asChild variant="outline" className="mt-2">
                <Link href="/admin/trackers/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Tracker
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
                        Tracker Details
                      </TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Rank Lists</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trackers.map((tracker: Tracker) => (
                      <TableRow key={tracker.id}>
                        <TableCell>
                          <div className="space-y-1.5">
                            <div className="font-medium text-base">
                              {tracker.title}
                            </div>
                            {tracker.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                                {tracker.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Tag className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span className="text-sm">{tracker.slug}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(tracker.status)}</TableCell>
                        <TableCell>
                          <span className="text-sm">{tracker.order}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <BadgeInfo className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span className="text-sm">
                              {tracker._count.rankLists} rank list
                              {tracker._count.rankLists !== 1 ? "s" : ""}
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
                                    href={`/admin/trackers/${tracker.id}/edit`}
                                    className="flex items-center justify-center"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Tracker</TooltipContent>
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
                                    href={`/admin/trackers/${tracker.id}/ranklists`}
                                    className="flex items-center justify-center"
                                  >
                                    <ListChecks className="h-4 w-4" />
                                    <span className="sr-only">
                                      Manage Ranklists
                                    </span>
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Manage Ranklists</TooltipContent>
                            </Tooltip>

                            <DeleteButton
                              id={tracker.id}
                              itemName={tracker.title}
                              itemType="Tracker"
                              onDelete={deleteTracker}
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
                  currentPage={pagination.currentPage}
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
