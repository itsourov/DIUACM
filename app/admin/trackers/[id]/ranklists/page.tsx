import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Plus } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { getTracker } from "../../actions";
import { RanklistsList } from "@/components/admin/trackers/ranklists/ranklists-list";
import { getRanklists } from "../../../../../app/admin/trackers/[id]/ranklists/actions";

interface RanklistsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: RanklistsPageProps): Promise<Metadata> {
  const trackerId = (await params).id;
  const { data: tracker } = await getTracker(trackerId);

  if (!tracker) {
    return {
      title: "Tracker not found",
      description: "The requested tracker could not be found",
    };
  }

  return {
    title: `Ranklists - ${tracker.title} | DIU ACM Admin`,
    description: `Manage ranklists for ${tracker.title}`,
  };
}

export default async function RanklistsPage({ params }: RanklistsPageProps) {
    const trackerId = (await params).id;

  const [trackerResponse, ranklistsResponse] = await Promise.all([
    getTracker(trackerId),
    getRanklists(trackerId),
  ]);

  const tracker = trackerResponse.data;
  const ranklists = ranklistsResponse.data || [];

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
            <h1 className="text-2xl font-bold tracking-tight">
              Tracker Ranklists
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage ranklists for {tracker.title}
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
      <RanklistsList trackerId={trackerId} initialRanklists={ranklists} />
    </div>
  );
}
