import Link from "next/link";
import {
    FileBarChart2,
    Plus,
    Pencil,
    List,
    Eye,
    EyeOff,
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
import { getPaginatedTrackers } from "./actions";
import { DeleteTrackerButton } from "./components/delete-tracker-button";
import { SearchTrackers } from "./components/search-trackers";
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
    title: "Trackers Management | DIU ACM Admin",
    description: "Manage tracking systems for monitoring progress and rankings",
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
    createdAt: Date | null;
    updatedAt: Date | null;
    _count: {
        rankLists: number;
    };
}

export default async function TrackersPage({
    searchParams,
}: TrackersPageProps) {
    const awaitedSearchParams = await searchParams;
    const page = parseInt(awaitedSearchParams.page ?? "1", 10);
    const search = awaitedSearchParams.search || undefined;

    const { data } = await getPaginatedTrackers(page, 10, search);

    const trackersData = data as { trackers: Tracker[]; pagination: { currentPage: number; totalPages: number; totalCount: number; pageSize: number } } | undefined;
    const trackers = trackersData?.trackers ?? [];
    const pagination = trackersData?.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        pageSize: 10,
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "published":
                return (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                        <Eye className="w-3 h-3 mr-1" />
                        Published
                    </Badge>
                );
            case "draft":
                return (
                    <Badge variant="secondary">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Draft
                    </Badge>
                );
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
                            Manage tracking systems for monitoring progress and rankings
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
                        <div className="text-center py-12">
                            <div className="rounded-full bg-muted/50 w-20 h-20 mx-auto flex items-center justify-center mb-4">
                                <FileBarChart2 className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                {search ? "No trackers found" : "No trackers yet"}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                                {search
                                    ? "We couldn't find any trackers matching your search. Try adjusting your search terms."
                                    : "Create your first tracker to start monitoring user progress and rankings."}
                            </p>
                            {!search && (
                                <Button asChild size="lg">
                                    <Link href="/admin/trackers/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First Tracker
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
                                                Tracker Details
                                            </TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Order</TableHead>
                                            <TableHead>Ranklists</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {trackers.map((tracker) => (
                                            <TableRow key={tracker.id}>
                                                <TableCell>
                                                    <div className="space-y-1.5">
                                                        <div className="font-medium text-base">
                                                            {tracker.title}
                                                        </div>
                                                        <div>
                                                            <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                                                                {tracker.slug}
                                                            </code>
                                                        </div>
                                                        {tracker.description && (
                                                            <div className="text-sm text-muted-foreground max-w-[220px] truncate">
                                                                {tracker.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(tracker.status)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{tracker.order}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <List className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                                        <span className="text-sm">
                                                            {tracker._count.rankLists} ranklist
                                                            {tracker._count.rankLists !== 1 ? "s" : ""}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {tracker.createdAt && (
                                                        <div className="flex items-center text-sm">
                                                            <span className="text-muted-foreground">
                                                                {format(tracker.createdAt, "PP")}
                                                            </span>
                                                        </div>
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
                                                                    <span className="sr-only">Tracker actions</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/admin/trackers/${tracker.id}/edit`}>
                                                                        <Pencil className="h-4 w-4 mr-2" />
                                                                        Edit Tracker
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/admin/trackers/${tracker.id}/ranklists`}>
                                                                        <List className="h-4 w-4 mr-2" />
                                                                        Manage Ranklists
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    asChild
                                                                >
                                                                    <DeleteTrackerButton
                                                                        id={tracker.id}
                                                                        title={tracker.title}
                                                                        hasRankLists={tracker._count.rankLists > 0}
                                                                        rankListCount={tracker._count.rankLists}
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