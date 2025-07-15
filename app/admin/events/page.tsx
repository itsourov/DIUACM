import Link from "next/link";
import {
    Calendar,
    Plus,
    Clock,
    Pencil,
    ExternalLink,
    Users,
    List,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";

export const metadata: Metadata = {
    title: "Events Management | DIU ACM Admin",
    description: "Manage all your events in one place",
};

interface Event {
    id: number;
    title: string;
    description?: string | null;
    status: string;
    startingAt: Date;
    endingAt: string;
    eventLink?: string | null;
    eventPassword?: string | null;
    openForAttendance: boolean;
    strictAttendance: boolean;
    type: string;
    participationScope: string;
    createdAt?: Date | null;
    updatedAt?: Date | null;
}

interface EventsPageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
    }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
    const awaitedSearchParams = await searchParams;
    const page = parseInt(awaitedSearchParams.page ?? "1", 10);
    const search = awaitedSearchParams.search || undefined;

    const { data } = await getPaginatedEvents(page, 10, search);

    const eventsData = data as { events: Event[]; pagination: { currentPage: number; totalPages: number; totalCount: number; pageSize: number } } | undefined;
    const events = eventsData?.events ?? [];
    const pagination = eventsData?.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        pageSize: 10,
    };

    const getEventTypeBadge = (type: string) => {
        switch (type) {
            case "contest":
                return <Badge variant="default">Contest</Badge>;
            case "class":
                return <Badge variant="secondary">Class</Badge>;
            case "other":
                return <Badge variant="outline">Other</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "published":
                return <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>;
            case "draft":
                return <Badge variant="secondary">Draft</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getParticipationScopeBadge = (scope: string) => {
        switch (scope) {
            case "open_for_all":
                return <Badge className="bg-blue-500 hover:bg-blue-600">Open for All</Badge>;
            case "only_girls":
                return <Badge className="bg-pink-500 hover:bg-pink-600">Only Girls</Badge>;
            case "junior_programmers":
                return <Badge className="bg-purple-500 hover:bg-purple-600">Junior Programmers</Badge>;
            case "selected_persons":
                return <Badge className="bg-orange-500 hover:bg-orange-600">Selected Persons</Badge>;
            default:
                return <Badge variant="outline">{scope}</Badge>;
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
                                <Calendar className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">No events found</h3>
                            {search ? (
                                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                                    No events match &quot;{search}&quot;. Try a different search
                                    term or create a new event.
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
                                            <TableHead className="min-w-[240px]">
                                                Event Details
                                            </TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Starting Time</TableHead>
                                            <TableHead>Participation</TableHead>
                                            <TableHead>Attendance</TableHead>
                                            <TableHead className="w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {events.map((event) => (
                                            <TableRow key={event.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{event.title}</div>
                                                        {event.description && (
                                                            <div className="text-sm text-muted-foreground line-clamp-1">
                                                                {event.description}
                                                            </div>
                                                        )}
                                                        {event.eventLink && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                                                <a
                                                                    href={event.eventLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-blue-600 hover:underline"
                                                                >
                                                                    Event Link
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getEventTypeBadge(event.type)}</TableCell>
                                                <TableCell>{getStatusBadge(event.status)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">
                                                            {format(new Date(event.startingAt), "MMM dd, yyyy HH:mm")}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        Duration: {event.endingAt}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getParticipationScopeBadge(event.participationScope)}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant={event.openForAttendance ? "default" : "secondary"} className="text-xs">
                                                            {event.openForAttendance ? "Open" : "Closed"}
                                                        </Badge>
                                                        {event.strictAttendance && (
                                                            <Badge variant="outline" className="text-xs">
                                                                Strict
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button asChild variant="outline" size="sm">
                                                            <Link href={`/admin/events/${event.id}/edit`}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" size="sm">
                                                                    <Settings className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/admin/events/${event.id}/attendees`}>
                                                                        <Users className="h-4 w-4 mr-2" />
                                                                        Manage Attendees
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/admin/events/${event.id}/ranklists`}>
                                                                        <List className="h-4 w-4 mr-2" />
                                                                        Manage Ranklists
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                                    <DeleteEventButton
                                                                        eventId={event.id}
                                                                        eventTitle={event.title}
                                                                    />
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
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