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
import { getEvent, getEventAttendees } from "./actions";
import { AttendeesList } from "./components/attendees-list";

interface AttendeesPageProps {
    params: Promise<{
        id: string;
    }>;
}

export async function generateMetadata({
    params,
}: AttendeesPageProps): Promise<Metadata> {
    const awaitedParams = await params;
    const eventId = parseInt(awaitedParams.id);

    if (isNaN(eventId)) {
        return {
            title: "Not Found",
            description: "Invalid event ID",
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
        title: `Event Attendees - ${event.title} | DIU ACM Admin`,
        description: `Manage attendees for ${event.title}`,
    };
}

export default async function AttendeesPage({ params }: AttendeesPageProps) {
    const awaitedParams = await params;
    const eventId = parseInt(awaitedParams.id);

    if (isNaN(eventId)) {
        notFound();
    }

    const [eventResponse, attendeesResponse] = await Promise.all([
        getEvent(eventId),
        getEventAttendees(eventId),
    ]);

    const { data: event, error } = eventResponse;
    const attendees = attendeesResponse.data || [];

    if (error || !event) {
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
                                Attendees
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Event Attendees</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage attendees for {event.title}
                    </p>
                </div>
            </div>

            <AttendeesList eventId={eventId} eventTitle={event.title} initialAttendees={attendees} />
        </div>
    );
} 