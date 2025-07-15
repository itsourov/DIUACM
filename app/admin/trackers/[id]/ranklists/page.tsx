import Link from "next/link";
import {
    List,
    Plus,
    Pencil,
    Calendar,
    Users,
    CheckCircle,
    XCircle,
    Target,
} from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { getTracker } from "../../actions";
import { getPaginatedRanklists } from "./actions";
import { DeleteRanklistButton } from "./components/delete-ranklist-button";
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

interface RanklistsPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{
        page?: string;
        search?: string;
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

export async function generateMetadata({ params }: RanklistsPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const trackerId = parseInt(resolvedParams.id);

    if (isNaN(trackerId)) {
        return { title: "Ranklists | DIU ACM Admin" };
    }

    const { data: tracker } = await getTracker(trackerId);

    return {
        title: `${(tracker as { title?: string })?.title || 'Tracker'} - Ranklists | DIU ACM Admin`,
        description: `Manage ranklists for ${(tracker as { title?: string })?.title || 'tracker'}`,
    };
}

export default async function RanklistsPage({
    params,
    searchParams,
}: RanklistsPageProps) {
    const resolvedParams = await params;
    const awaitedSearchParams = await searchParams;
    const trackerId = parseInt(resolvedParams.id);
    const page = parseInt(awaitedSearchParams.page ?? "1", 10);
    const search = awaitedSearchParams.search || undefined;

    if (isNaN(trackerId)) {
        notFound();
    }

    const [trackerResponse, ranklistsResponse] = await Promise.all([
        getTracker(trackerId),
        getPaginatedRanklists(trackerId, page, 10, search),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tracker = trackerResponse.data as any;
    const { data } = ranklistsResponse;

    if (!tracker) {
        notFound();
    }

    const ranklistsData = data as { ranklists: Ranklist[]; pagination: { currentPage: number; totalPages: number; totalCount: number; pageSize: number } } | undefined;
    const ranklists = ranklistsData?.ranklists ?? [];
    const pagination = ranklistsData?.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        pageSize: 10,
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
            </Badge>
        ) : (
            <Badge variant="secondary">
                <XCircle className="w-3 h-3 mr-1" />
                Inactive
            </Badge>
        );
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
                            <BreadcrumbLink asChild>
                                <Link href="/admin/trackers">Trackers</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href={`/admin/trackers/${trackerId}/edit`}>
                                    {tracker.title}
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
                        <h1 className="text-2xl font-bold tracking-tight">Ranklists</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage ranklists for tracker &quot;{tracker.title}&quot;
                        </p>
                    </div>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href={`/admin/trackers/${trackerId}/ranklists/create`}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Ranklist
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div>
                        <CardTitle className="text-xl">Ranklists</CardTitle>
                        <CardDescription>
                            Total: {pagination.totalCount} ranklist
                            {pagination.totalCount !== 1 ? "s" : ""}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {ranklists.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="rounded-full bg-muted/50 w-20 h-20 mx-auto flex items-center justify-center mb-4">
                                <List className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                {search ? "No ranklists found" : "No ranklists yet"}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                                {search
                                    ? "We couldn't find any ranklists matching your search. Try adjusting your search terms."
                                    : "Create your first ranklist to start tracking user progress and scores."}
                            </p>
                            {!search && (
                                <Button asChild size="lg">
                                    <Link href={`/admin/trackers/${trackerId}/ranklists/create`}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First Ranklist
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[240px]">
                                                Ranklist Details
                                            </TableHead>
                                            <TableHead>Weight</TableHead>
                                            <TableHead>Order</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Events</TableHead>
                                            <TableHead>Users</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="w-[100px]">Actions</TableHead>
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
                                                        <div className="flex items-center gap-2">
                                                            {ranklist.considerStrictAttendance && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <Target className="w-3 h-3 mr-1" />
                                                                    Strict
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {ranklist.description && (
                                                            <div className="text-sm text-muted-foreground max-w-[220px] truncate">
                                                                {ranklist.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">
                                                        {ranklist.weightOfUpsolve}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{ranklist.order}</Badge>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(ranklist.isActive)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="text-xs">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        {ranklist._count.events}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="text-xs">
                                                        <Users className="w-3 h-3 mr-1" />
                                                        {ranklist._count.users}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {ranklist.createdAt && (
                                                        <span className="text-sm text-muted-foreground">
                                                            {format(ranklist.createdAt, "MMM dd, yyyy")}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-1">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Settings className="h-4 w-4" />
                                                                    <span className="sr-only">Ranklist actions</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/admin/trackers/${trackerId}/ranklists/${ranklist.id}/edit`}>
                                                                        <Pencil className="h-4 w-4 mr-2" />
                                                                        Edit Ranklist
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/admin/trackers/${trackerId}/ranklists/${ranklist.id}/events`}>
                                                                        <Calendar className="h-4 w-4 mr-2" />
                                                                        Manage Events ({ranklist._count.events})
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/admin/trackers/${trackerId}/ranklists/${ranklist.id}/users`}>
                                                                        <Users className="h-4 w-4 mr-2" />
                                                                        Manage Users ({ranklist._count.users})
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    asChild
                                                                >
                                                                    <DeleteRanklistButton
                                                                        id={ranklist.id}
                                                                        trackerId={trackerId}
                                                                        keyword={ranklist.keyword}
                                                                        hasAttachments={ranklist._count.events > 0 || ranklist._count.users > 0}
                                                                        eventCount={ranklist._count.events}
                                                                        userCount={ranklist._count.users}
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-auto p-0 text-destructive hover:bg-transparent justify-start w-full"
                                                                        showText={true}
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