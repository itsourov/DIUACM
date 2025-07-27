import { EventForm } from "../components/event-form";
import { getActiveRanklists } from "../actions";
import { Metadata } from "next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Event | DIU ACM Admin",
  description: "Create a new event",
};

export default async function CreateEventPage() {
  // Fetch active ranklists
  const ranklistsResponse = await getActiveRanklists();
  const activeRanklists = ranklistsResponse.success
    ? ranklistsResponse.data || []
    : [];

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
              <BreadcrumbLink className="text-foreground font-medium">
                Create Event
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Create New Event
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add a new event to your schedule
            </p>
          </div>
        </div>
      </div>
      <EventForm activeRanklists={activeRanklists} />
    </div>
  );
}
