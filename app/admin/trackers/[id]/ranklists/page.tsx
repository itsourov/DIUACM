import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Plus, TrendingUp, Edit, Users, Calendar } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { getTracker } from "../../actions";
import { getPaginatedRanklists } from "./actions";
import { DeleteRanklistButton } from "./components/delete-ranklist-button";
import { formatDistanceToNow } from "date-fns";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RanklistsPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Ranklist {
  id: number;
  trackerId: number;
  keyword: string;
  description: string | null;
  weightOfUpsolve: number;
  order: number;
  isActive: boolean;
  considerStrictAttendance: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  _count: {
    events: number;
    users: number;
  };
}

export async function generateMetadata({
  params,
}: RanklistsPageProps): Promise<Metadata> {
  const trackerId = (await params).id;
  const { data: tracker } = await getTracker(parseInt(trackerId));

  if (!tracker) {
    return {
      title: "Tracker not found",
      description: "The requested tracker could not be found",
    };
  }

  return {
    title: `Ranklists - ${
      (tracker as { title?: string })?.title
    } | DIU ACM Admin`,
    description: `Manage ranklists for ${
      (tracker as { title?: string })?.title
    }`,
  };
}

export default async function RanklistsPage({ params }: RanklistsPageProps) {
  const trackerId = (await params).id;

  const [trackerResponse, ranklistsResponse] = await Promise.all([
    getTracker(parseInt(trackerId)),
    getPaginatedRanklists(parseInt(trackerId), 1, 1000), // Get all ranklists
  ]);

  const tracker = trackerResponse.data;
  const ranklistsData = ranklistsResponse.data as
    | {
        ranklists: Ranklist[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalCount: number;
          pageSize: number;
        };
      }
    | undefined;
  const ranklists = ranklistsData?.ranklists || [];

  if (!tracker) {
    notFound();
  }

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
                <Link href="/admin/trackers">Trackers</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/admin/trackers/${trackerId}/edit`}>
                  {(tracker as { title?: string })?.title}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-foreground font-medium">
                Ranklists
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Tracker Ranklists
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage ranklists for {(tracker as { title?: string })?.title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href={`/admin/trackers/${trackerId}/ranklists/create`}>
                <Plus className="h-4 w-4 mr-2" />
                Add Ranklist
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Ranklists List
            </CardTitle>
            <CardDescription>
              Total: {ranklists.length} ranklist
              {ranklists.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {ranklists.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="rounded-full bg-muted p-3">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No ranklists yet</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-xs">
                Start adding ranklists to this tracker using the &quot;Add
                Ranklist&quot; button.
              </p>
              <Button asChild variant="outline" className="mt-2">
                <Link href={`/admin/trackers/${trackerId}/ranklists/create`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Ranklist
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[220px]">
                      Ranklist Details
                    </TableHead>
                    <TableHead>Upsolve Weight</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[140px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranklists.map((ranklist) => (
                    <TableRow key={ranklist.id}>
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="font-medium text-base">
                            {ranklist.keyword}
                          </div>
                          {ranklist.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                              {ranklist.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {ranklist.weightOfUpsolve.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{ranklist.order}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-sm">
                            {ranklist._count.events} event
                            {ranklist._count.events !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-sm">
                            {ranklist._count.users} user
                            {ranklist._count.users !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {ranklist.createdAt &&
                          formatDistanceToNow(new Date(ranklist.createdAt), {
                            addSuffix: true,
                          })}
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
                                  href={`/admin/trackers/${trackerId}/ranklists/${ranklist.id}/edit`}
                                  className="flex items-center justify-center"
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Ranklist</TooltipContent>
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
                                  href={`/admin/trackers/${trackerId}/ranklists/${ranklist.id}/events`}
                                  className="flex items-center justify-center"
                                >
                                  <Calendar className="h-4 w-4" />
                                  <span className="sr-only">Manage Events</span>
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Manage Events</TooltipContent>
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
                                  href={`/admin/trackers/${trackerId}/ranklists/${ranklist.id}/users`}
                                  className="flex items-center justify-center"
                                >
                                  <Users className="h-4 w-4" />
                                  <span className="sr-only">Manage Users</span>
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Manage Users</TooltipContent>
                          </Tooltip>

                          <DeleteRanklistButton
                            id={ranklist.id}
                            trackerId={parseInt(trackerId)}
                            keyword={ranklist.keyword}
                            hasAttachments={
                              ranklist._count.events > 0 ||
                              ranklist._count.users > 0
                            }
                            eventCount={ranklist._count.events}
                            userCount={ranklist._count.users}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            showText={false}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
