"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, CalendarDays, Edit } from "lucide-react";
import { Event, EventRankList } from "@prisma/client";
import { removeEventFromRanklist } from "@/app/admin/trackers/[id]/ranklists/[ranklistId]/events/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { AddEventDialog } from "./add-event-dialog";
import { EditWeightDialog } from "./edit-weight-dialog";

type EventWithData = EventRankList & {
  event: Event;
};

interface EventListProps {
  ranklistId: string;
  initialEvents: EventWithData[];
}

export function EventList({ ranklistId, initialEvents }: EventListProps) {
  const [events, setEvents] = useState<EventWithData[]>(initialEvents);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventWithData | null>(null);

  const handleEventAdded = (newEvent: EventWithData) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  const handleRemoveEvent = async (eventRanklistId: string) => {
    try {
      setIsDeleting(eventRanklistId);
      const response = await removeEventFromRanklist(
        eventRanklistId,
        ranklistId
      );

      if (response.success) {
        setEvents(events.filter((item) => item.id !== eventRanklistId));
        toast.success("Event removed successfully");
      } else {
        toast.error(response.error || "Failed to remove event");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleWeightUpdated = (updatedEvent: EventWithData) => {
    setEvents(
      events.map((item) => (item.id === updatedEvent.id ? updatedEvent : item))
    );
    setEditingEvent(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-xl">
          <CalendarDays className="h-5 w-5 mr-2" />
          Events ({events.length})
        </CardTitle>
        <AddEventDialog
          ranklistId={ranklistId}
          onEventAdded={handleEventAdded}
        />
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="rounded-full bg-muted p-3">
              <CalendarDays className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No events yet</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-xs">
              Start adding events to this ranklist using the &quot;Add
              Event&quot; button.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {getEventTypeLabel(item.event.type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {format(new Date(item.event.startingAt), "MMM d, yyyy")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(item.event.startingAt), "h:mm a")} -{" "}
                        {format(new Date(item.event.endingAt), "h:mm a")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(item.event.status)}>
                        {getStatusLabel(item.event.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.weight.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setEditingEvent(item)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit Weight</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          disabled={isDeleting === item.id}
                          onClick={() => handleRemoveEvent(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Weight edit dialog */}
        {editingEvent && (
          <EditWeightDialog
            ranklistId={ranklistId}
            event={editingEvent}
            onClose={() => setEditingEvent(null)}
            onWeightUpdated={handleWeightUpdated}
          />
        )}
      </CardContent>
    </Card>
  );
}

// Helper functions for formatting event data
function getStatusLabel(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "Published";
    case "DRAFT":
      return "Draft";
    case "PRIVATE":
      return "Private";
    default:
      return status;
  }
}

function getStatusVariant(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case "PUBLISHED":
      return "default";
    case "DRAFT":
      return "secondary";
    case "PRIVATE":
      return "outline";
    default:
      return "secondary";
  }
}

function getEventTypeLabel(type: string) {
  switch (type) {
    case "CONTEST":
      return "Contest";
    case "CLASS":
      return "Class";
    case "OTHER":
      return "Other";
    default:
      return type;
  }
}
