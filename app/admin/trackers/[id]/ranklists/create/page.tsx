import { notFound } from "next/navigation";
import { RanklistForm } from "../components/ranklist-form";
import { getTracker } from "../../../actions";
import { Metadata } from "next";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

interface CreateRanklistPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CreateRanklistPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const trackerId = parseInt(resolvedParams.id);

    if (isNaN(trackerId)) {
        return { title: "Create Ranklist | DIU ACM Admin" };
    }

    const { data: tracker } = await getTracker(trackerId);

    return {
        title: `Create Ranklist - ${(tracker as { title?: string })?.title || 'Tracker'} | DIU ACM Admin`,
        description: `Create a new ranklist for ${(tracker as { title?: string })?.title || 'tracker'}`,
    };
}

export default async function CreateRanklistPage({
    params,
}: CreateRanklistPageProps) {
    const resolvedParams = await params;
    const trackerId = parseInt(resolvedParams.id);

    if (isNaN(trackerId)) {
        notFound();
    }

    const { data: trackerData, error } = await getTracker(trackerId);

    if (error || !trackerData) {
        notFound();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tracker = trackerData as any;

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
                            <BreadcrumbLink asChild>
                                <Link href={`/admin/trackers/${trackerId}/ranklists`}>
                                    Ranklists
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink className="text-foreground font-medium">
                                Create Ranklist
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Create New Ranklist
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Add a new ranklist to tracker &quot;{tracker.title}&quot;
                        </p>
                    </div>
                </div>
            </div>
            <RanklistForm trackerId={trackerId} />
        </div>
    );
} 