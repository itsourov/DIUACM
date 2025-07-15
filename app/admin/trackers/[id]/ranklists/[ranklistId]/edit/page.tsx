import { notFound } from "next/navigation";
import { RanklistForm } from "../../components/ranklist-form";
import { getTracker } from "../../../../actions";
import { getRanklist } from "../../actions";
import { Metadata } from "next";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Users } from "lucide-react";

interface EditRanklistPageProps {
    params: Promise<{ id: string; ranklistId: string }>;
}

export async function generateMetadata({ params }: EditRanklistPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const trackerId = parseInt(resolvedParams.id);
    const ranklistId = parseInt(resolvedParams.ranklistId);

    if (isNaN(trackerId) || isNaN(ranklistId)) {
        return { title: "Edit Ranklist | DIU ACM Admin" };
    }

    const [{ data: tracker }, { data: ranklist }] = await Promise.all([
        getTracker(trackerId),
        getRanklist(ranklistId, trackerId),
    ]);

    return {
        title: `Edit ${(ranklist as { keyword?: string })?.keyword || 'Ranklist'} - ${(tracker as { title?: string })?.title || 'Tracker'} | DIU ACM Admin`,
        description: `Edit ranklist ${(ranklist as { keyword?: string })?.keyword || 'ranklist'} settings`,
    };
}

export default async function EditRanklistPage({
    params,
}: EditRanklistPageProps) {
    const resolvedParams = await params;
    const trackerId = parseInt(resolvedParams.id);
    const ranklistId = parseInt(resolvedParams.ranklistId);

    if (isNaN(trackerId) || isNaN(ranklistId)) {
        notFound();
    }

    const [trackerResponse, ranklistResponse] = await Promise.all([
        getTracker(trackerId),
        getRanklist(ranklistId, trackerId),
    ]);

    const tracker = trackerResponse.data;
    const ranklist = ranklistResponse.data;

    if (!tracker || !ranklist) {
        notFound();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const trackerData = tracker as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ranklistData = ranklist as any;

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
                                    {trackerData.title}
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href={`/admin/trackers/${trackerId}/ranklists`}>
                                    Ranklists
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink className="text-foreground font-medium">
                                Edit Ranklist
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit Ranklist: {ranklistData.keyword}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Modify ranklist settings and configuration
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/admin/trackers/${trackerId}/ranklists/${ranklistId}/events`}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Manage Events
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/admin/trackers/${trackerId}/ranklists/${ranklistId}/users`}>
                                <Users className="h-4 w-4 mr-2" />
                                Manage Users
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <RanklistForm trackerId={trackerId} initialData={ranklistData} isEditing />
        </div>
    );
} 