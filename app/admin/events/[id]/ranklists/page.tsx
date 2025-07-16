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
import { getEvent, getEventRanklists } from "./actions";
import { RanklistsList } from "./components/ranklists-list";

interface RanklistsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: RanklistsPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const eventId = parseInt(resolvedParams.id, 10);

  if (isNaN(eventId)) {
    return {
      title: "Not Found",
      description: "The requested resource could not be found",
    };
  }

  const { data: event, error } = await getEvent(eventId);

  if (error || !event) {
    return {
      title: "Not Found",
      description: "The requested resource could not be found",
    };
  }

  return {
    title: `Event Ranklists - ${event.title} | DIU ACM Admin`,
    description: `Manage ranklists for ${event.title}`,
  };
}

export default async function RanklistsPage({ params }: RanklistsPageProps) {
  const resolvedParams = await params;
  const eventId = parseInt(resolvedParams.id, 10);

  if (isNaN(eventId)) {
    notFound();
  }

  const [eventResponse, ranklistsResponse] = await Promise.all([
    getEvent(eventId),
    getEventRanklists(eventId),
  ]);

  const event = eventResponse.data;
  const ranklists = ranklistsResponse.data || [];

  if (!event) {
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
                <Link href="/admin/events">Events</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/admin/events/${eventId}/edit`}>
                  {event.title}
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Event Ranklists</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage ranklists for &quot;{event.title}&quot;
          </p>
        </div>
      </div>
      <RanklistsList eventId={eventId} initialRanklists={ranklists} />
    </div>
  );
}
