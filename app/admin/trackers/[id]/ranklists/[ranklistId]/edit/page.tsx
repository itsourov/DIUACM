import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getTracker } from "../../../../actions";
import { getRanklist } from "../../actions";
import { RanklistForm } from "../../components/ranklist-form";

interface EditRanklistPageProps {
  params: Promise<{
    id: string;
    ranklistId: string;
  }>;
}

export async function generateMetadata({
  params,
}: EditRanklistPageProps): Promise<Metadata> {
  const awaitedParams = await params;
  const trackerId = awaitedParams.id;
  const ranklistId = awaitedParams.ranklistId;

  const [trackerResponse, ranklistResponse] = await Promise.all([
    getTracker(trackerId),
    getRanklist(ranklistId),
  ]);

  const tracker = trackerResponse.data;
  const ranklist = ranklistResponse.data;

  if (!tracker || !ranklist) {
    return {
      title: "Not Found",
      description: "The requested resource could not be found",
    };
  }

  return {
    title: `Edit ${ranklist.keyword} - ${tracker.title} | DIU ACM Admin`,
    description: `Edit ranklist details for ${ranklist.keyword}`,
  };
}

export default async function EditRanklistPage({
  params,
}: EditRanklistPageProps) {
  const awaitedParams = await params;
  const trackerId = awaitedParams.id;
  const ranklistId = awaitedParams.ranklistId;

  const [trackerResponse, ranklistResponse] = await Promise.all([
    getTracker(trackerId),
    getRanklist(ranklistId),
  ]);

  const tracker = trackerResponse.data;
  const ranklist = ranklistResponse.data;

  if (!tracker || !ranklist) {
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit Ranklist: {ranklist.keyword}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Modify ranklist details for {tracker.title}
          </p>
        </div>
      </div>
      <RanklistForm trackerId={trackerId} initialData={ranklist} isEditing />
    </div>
  );
}
