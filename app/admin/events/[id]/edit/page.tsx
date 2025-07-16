import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Users, List } from "lucide-react";
import { type Event } from "@/db/schema";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getEvent } from "../../actions";
import { EventForm } from "../../components/event-form";

// Type assertion helper to ensure required fields
function assertEventForEdit(event: Event) {
  if (!event.id) {
    throw new Error("Event ID is required for editing");
  }
  return event;
}

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditEventPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const eventId = parseInt(resolvedParams.id);

  if (isNaN(eventId)) {
    return {
      title: "Not Found",
      description: "Invalid event ID",
    };
  }

  const { data: eventData, error } = await getEvent(eventId);

  if (error || !eventData || !eventData.title) {
    return {
      title: "Not Found",
      description: "The requested event could not be found",
    };
  }

  return {
    title: `Edit Event - ${eventData.title} | DIU ACM Admin`,
    description: `Edit ${eventData.title}`,
  };
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const resolvedParams = await params;
  const eventId = parseInt(resolvedParams.id);

  if (isNaN(eventId)) {
    notFound();
  }

  const { data: eventData, error } = await getEvent(eventId);

  if (error || !eventData) {
    notFound();
  }

  const event = assertEventForEdit(eventData);

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
                Edit Event
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Event: {event.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Modify event details and settings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/events/${eventId}/attendees`}>
                <Users className="h-4 w-4 mr-2" />
                Manage Attendees
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/admin/events/${eventId}/ranklists`}>
                <List className="h-4 w-4 mr-2" />
                Manage Ranklists
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <EventForm event={event} isEditing />
    </div>
  );
}
