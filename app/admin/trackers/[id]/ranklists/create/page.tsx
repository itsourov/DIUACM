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
import { getTracker } from "../../../actions";
import { RanklistForm } from "../components/ranklist-form";

interface CreateRanklistPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: CreateRanklistPageProps): Promise<Metadata> {
  const awaitedParams = await params;
  const trackerId = awaitedParams.id;
  const { data: tracker } = await getTracker(trackerId);

  if (!tracker) {
    return {
      title: "Tracker not found",
      description: "The requested tracker could not be found",
    };
  }

  return {
    title: `Add Ranklist - ${tracker.title} | DIU ACM Admin`,
    description: `Add a new ranklist to ${tracker.title}`,
  };
}

export default async function CreateRanklistPage({
  params,
}: CreateRanklistPageProps) {
  const awaitedParams = await params;
  const trackerId = awaitedParams.id;

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
                Add Ranklist
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Ranklist</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new ranklist for {tracker.title}
          </p>
        </div>
      </div>
      <RanklistForm trackerId={trackerId} />
    </div>
  );
}
