import Link from "next/link";
import {
  CalendarRange,
  Plus,
  CalendarClock,
  Users,
  Pencil,
} from "lucide-react";
import { Metadata } from "next";
import { format } from "date-fns";
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
import { CustomPagination } from "@/components/custom-pagination";
import { getPaginatedEvents } from "./actions";
import { DeleteEventButton } from "./components/delete-event-button";
import { SearchEvents } from "./components/search-events";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Events Management | DIU ACM Admin",
  description: "Manage all your events in one place",
};

interface EventsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    type?: string;
  }>;
}

// Define badge variant types
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const awaitedSearchParams = await searchParams;
  const page = parseInt(awaitedSearchParams.page ?? "1", 10);
  const search = awaitedSearchParams.search || undefined;
  const type = awaitedSearchParams.type || undefined;

  const { data } = await getPaginatedEvents(page, 10, search, type);

  const events = data?.events ?? [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
  };

  // Helper function to determine badge variant based on event status
  const getStatusVariant = (status: string): BadgeVariant => {
    switch (status) {
      case "PUBLISHED":
        return "default"; // Use default (blue) for published
      case "DRAFT":
        return "secondary"; // Use secondary (gray) for drafts
      case "PRIVATE":
        return "outline"; // Use outline for private
      default:
        return "default";
    }
  };

  // Helper function to format event type
  const formatEventType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
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
                Events
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Events</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your events and activities
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/events/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-xl">Events List</CardTitle>
            <CardDescription>
              Total: {pagination.totalCount} event
              {pagination.totalCount !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <SearchEvents />
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <div className="rounded-full bg-muted p-3">
                <CalendarRange className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No events found</h3>
              {search || type ? (
                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  No events match your search criteria. Try different filters or
                  create a new event.
                </p>
              ) : (
                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  Get started by creating your first event.
                </p>
              )}
              <Button asChild variant="outline" className="mt-2">
                <Link href="/admin/events/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[250px]">
                        Event Details
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Schedule
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Attendance
                      </TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-base">
                              {event.title}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Badge variant="outline" className="text-xs">
                                {formatEventType(event.type)}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <CalendarClock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                              <span className="text-sm">
                                {format(
                                  new Date(event.startingAt),
                                  "MMM d, yyyy"
                                )}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(event.startingAt), "h:mm a")} -{" "}
                              {format(new Date(event.endingAt), "h:mm a")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={getStatusVariant(event.status)}>
                            {event.status.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Users className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                              <span className="text-sm">
                                {event._count?.attendances || 0} attendee
                                {(event._count?.attendances || 0) !== 1
                                  ? "s"
                                  : ""}
                              </span>
                            </div>
                            <div className="text-xs">
                              {event.openForAttendance ? (
                                <Badge variant="outline" className="text-xs">
                                  Open for attendance
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">
                                  Attendance disabled
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              asChild
                            >
                              <Link
                                href={`/admin/events/${event.id}/edit`}
                                className="flex items-center justify-center"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <DeleteEventButton
                              eventId={event.id}
                              eventTitle={event.title}
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
