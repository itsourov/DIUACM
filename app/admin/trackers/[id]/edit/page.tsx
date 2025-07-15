import { notFound } from "next/navigation";
import { TrackerForm } from "../../components/tracker-form";
import { getTracker } from "../../actions";
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
import { List } from "lucide-react";

interface EditTrackerPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditTrackerPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const trackerId = parseInt(resolvedParams.id);

    if (isNaN(trackerId)) {
        return { title: "Edit Tracker | DIU ACM Admin" };
    }

    const { data: tracker } = await getTracker(trackerId);

    return {
        title: `Edit ${(tracker as { title?: string })?.title || 'Tracker'} | DIU ACM Admin`,
        description: `Edit ${(tracker as { title?: string })?.title || 'tracker'} settings and information`,
    };
}

export default async function EditTrackerPage({
    params,
}: EditTrackerPageProps) {
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
                            <BreadcrumbLink className="text-foreground font-medium">
                                Edit Tracker
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit Tracker: {tracker.title}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Modify tracker details and settings
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/admin/trackers/${trackerId}/ranklists`}>
                                <List className="h-4 w-4 mr-2" />
                                Manage Ranklists
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <TrackerForm initialData={tracker} isEditing />
        </div>
    );
} 