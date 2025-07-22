import Link from "next/link";
import { Calendar, Weight, Trash2, ArrowLeft, Edit3 } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getTracker } from "../../../../actions";
import {
  getRanklist,
  getAttachedEvents,
  detachEventFromRanklist,
  updateEventWeight,
} from "../../actions";
import { AttachEventDialog } from "./components/attach-event-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EventsPageProps {
  params: Promise<{ id: string; ranklistId: string }>;
}

interface AttachedEvent {
  eventId: number;
  weight: number;
  event: {
    id: number;
    title: string;
    description?: string | null;
    startingAt: Date;
    type: string;
  };
}

export async function generateMetadata({
  params,
}: EventsPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const trackerId = parseInt(resolvedParams.id);
  const ranklistId = parseInt(resolvedParams.ranklistId);

  if (isNaN(trackerId) || isNaN(ranklistId)) {
    return { title: "Ranklist Events | DIU ACM Admin" };
  }

  const [{ data: tracker }, { data: ranklist }] = await Promise.all([
    getTracker(trackerId),
    getRanklist(ranklistId, trackerId),
  ]);

  return {
    title: `${
      (ranklist as { keyword?: string })?.keyword || "Ranklist"
    } Events - ${
      (tracker as { title?: string })?.title || "Tracker"
    } | DIU ACM Admin`,
    description: `Manage events for ranklist ${
      (ranklist as { keyword?: string })?.keyword || "ranklist"
    }`,
  };
}

async function EditWeightButton({
  ranklistId,
  eventId,
  eventTitle,
  currentWeight,
}: {
  ranklistId: number;
  eventId: number;
  eventTitle: string;
  currentWeight: number;
}) {
  const handleUpdateWeight = async (formData: FormData) => {
    "use server";
    const newWeight = parseFloat(formData.get("weight") as string);
    if (isNaN(newWeight) || newWeight < 0.0 || newWeight > 1.0) {
      throw new Error("Weight must be between 0.0 and 1.0");
    }

    const response = await updateEventWeight(ranklistId, eventId, newWeight);
    if (!response.success) {
      throw new Error(response.error || "Failed to update weight");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit3 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Event Weight</DialogTitle>
          <DialogDescription>
            Update the weight for {eventTitle} in this ranklist.
          </DialogDescription>
        </DialogHeader>
        <form action={handleUpdateWeight}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.01"
                min="0.0"
                max="1.0"
                defaultValue={currentWeight}
                placeholder="Enter new weight"
                required
              />
              <p className="text-xs text-muted-foreground">
                Weight between 0.0 and 1.0 determines the importance of this
                event
              </p>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit">Update Weight</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

async function DetachEventButton({
  ranklistId,
  eventId,
  eventTitle,
}: {
  ranklistId: number;
  eventId: number;
  eventTitle: string;
}) {
  const handleDetach = async () => {
    "use server";
    const response = await detachEventFromRanklist(ranklistId, eventId);
    if (!response.success) {
      throw new Error(response.error || "Failed to detach event");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Detach Event</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to detach &quot;{eventTitle}&quot; from this
            ranklist? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDetach}
          >
            Detach Event
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default async function EventsPage({ params }: EventsPageProps) {
  const resolvedParams = await params;
  const trackerId = parseInt(resolvedParams.id);
  const ranklistId = parseInt(resolvedParams.ranklistId);

  if (isNaN(trackerId) || isNaN(ranklistId)) {
    notFound();
  }

  const [trackerResponse, ranklistResponse, eventsResponse] = await Promise.all(
    [
      getTracker(trackerId),
      getRanklist(ranklistId, trackerId),
      getAttachedEvents(ranklistId),
    ]
  );

  const tracker = trackerResponse.data;
  const ranklist = ranklistResponse.data;
  const { data: eventsData } = eventsResponse;

  if (!tracker || !ranklist) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trackerData = tracker as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ranklistData = ranklist as any;
  const events = (eventsData as AttachedEvent[]) || [];

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "contest":
        return <Badge variant="default">Contest</Badge>;
      case "class":
        return <Badge variant="secondary">Class</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

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
                  {trackerData.title}
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
              <BreadcrumbLink asChild>
                <Link
                  href={`/admin/trackers/${trackerId}/ranklists/${ranklistId}/edit`}
                >
                  {ranklistData.keyword}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-foreground font-medium">
                Events
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Events for {ranklistData.keyword}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage event attachments and weights for this ranklist
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link
                href={`/admin/trackers/${trackerId}/ranklists/${ranklistId}/edit`}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Ranklist
              </Link>
            </Button>
            <AttachEventDialog ranklistId={ranklistId} />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-xl">Attached Events</CardTitle>
            <CardDescription>
              Total: {events.length} event
              {events.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <div className="rounded-full bg-muted p-3">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No events attached</h3>
              <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                Start by attaching events to this ranklist to track user
                participation and scores.
              </p>
              <AttachEventDialog ranklistId={ranklistId} />
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((item) => (
                      <TableRow key={item.eventId}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{item.event.title}</p>
                            {item.event.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-xs">
                                {item.event.description.length > 60
                                  ? `${item.event.description.substring(
                                      0,
                                      60
                                    )}...`
                                  : item.event.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getEventTypeBadge(item.event.type)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {format(
                              new Date(item.event.startingAt),
                              "MMM dd, yyyy"
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            <Weight className="w-3 h-3 mr-1" />
                            {item.weight}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <EditWeightButton
                              ranklistId={ranklistId}
                              eventId={item.eventId}
                              eventTitle={item.event.title}
                              currentWeight={item.weight}
                            />
                            <DetachEventButton
                              ranklistId={ranklistId}
                              eventId={item.eventId}
                              eventTitle={item.event.title}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
