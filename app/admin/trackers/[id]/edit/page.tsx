import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { TrendingUp } from "lucide-react";
import { getTracker } from "../../actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { TrackerForm } from "../../components/tracker-form";

interface EditTrackerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Edit Tracker | DIU ACM Admin",
  description: "Edit tracker details",
};

export default async function EditTrackerPage({
  params,
}: EditTrackerPageProps) {
  const resolvedParams = await params;
  const trackerId = resolvedParams.id;

  const { data: tracker, error } = await getTracker(trackerId);

  if (error || !tracker) {
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
                <TrendingUp className="h-4 w-4 mr-2" />
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
