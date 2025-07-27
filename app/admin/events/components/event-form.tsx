"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Event,
  VisibilityStatus,
  EventType,
  ParticipationScope,
} from "@/db/schema";
import { format } from "date-fns";

import { eventFormSchema, type EventFormValues } from "../schemas/event";
import { createEvent, updateEvent, type ActiveRanklist } from "../actions";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { QuickFillDialog } from "./quick-fill-dialog";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ExtendedEvent extends Event {
  ranklists?: Array<{
    id: number;
    weight: number;
  }>;
}

interface EventFormProps {
  initialData?: ExtendedEvent | null;
  isEditing?: boolean;
  eventId?: number;
  activeRanklists?: ActiveRanklist[];
}

export function EventForm({
  initialData,
  isEditing = false,
  eventId,
  activeRanklists = [],
}: EventFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Format dates for datetime-local inputs
  // The format needed is "yyyy-MM-ddThh:mm" for datetime-local inputs
  const formatDateForInput = (date: Date | null | undefined) => {
    if (!date) return "";
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
  };

  const form = useForm<EventFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(eventFormSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      status: initialData?.status || VisibilityStatus.PUBLISHED,
      startingAt: initialData?.startingAt
        ? new Date(initialData.startingAt)
        : new Date(),
      endingAt: initialData?.endingAt
        ? new Date(initialData.endingAt)
        : new Date(Date.now() + 2 * 60 * 60 * 1000),
      eventLink: initialData?.eventLink || "",
      eventPassword: initialData?.eventPassword || "",
      openForAttendance: initialData?.openForAttendance ?? false,
      strictAttendance: initialData?.strictAttendance ?? false,
      type: initialData?.type || EventType.CONTEST,
      participationScope:
        initialData?.participationScope || ParticipationScope.OPEN_FOR_ALL,
      ranklists: initialData?.ranklists || [],
    },
  });

  const onSubmit = async (values: EventFormValues) => {
    setIsLoading(true);
    try {
      let response;

      if (isEditing && eventId) {
        response = await updateEvent(eventId, values);
      } else {
        response = await createEvent(values);
      }

      if (response.success) {
        toast.success(response.message || "Success");
        router.push("/admin/events");
      } else {
        if (typeof response.error === "string") {
          toast.error(response.error);
        } else {
          toast.error("Please check the form for errors.");
        }
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for when contest data is fetched from quick fill
  const handleQuickFill = (contestData: Partial<EventFormValues>) => {
    // Update the form with the fetched contest data
    form.reset({
      ...form.getValues(),
      ...contestData,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>{isEditing ? "Edit Event" : "Create New Event"}</CardTitle>
          {!isEditing && <QuickFillDialog onFill={handleQuickFill} />}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter event description (optional)"
                        className="min-h-32 resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide details about the event, including topics,
                      speakers, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Event Schedule Section */}
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="text-lg font-medium">Schedule</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startingAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={formatDateForInput(field.value)}
                          onChange={(e) => {
                            const date = e.target.value
                              ? new Date(e.target.value)
                              : null;
                            field.onChange(date);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endingAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={formatDateForInput(field.value)}
                          onChange={(e) => {
                            const date = e.target.value
                              ? new Date(e.target.value)
                              : null;
                            field.onChange(date);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Event Settings Section */}
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="text-lg font-medium">Event Settings</h3>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(VisibilityStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() +
                                status.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Published events are visible to everyone.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(EventType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() +
                                type.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="eventLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Link</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        External link for the event (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Optional password"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Password for accessing the event (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Attendance Settings */}
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="text-lg font-medium">Attendance Settings</h3>

              <FormField
                control={form.control}
                name="participationScope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Participation Scope</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scope" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ParticipationScope).map((scope) => (
                          <SelectItem key={scope} value={scope}>
                            {scope
                              .split("_")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              )
                              .join(" ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Define who can participate in this event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="openForAttendance"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Open for Attendance
                        </FormLabel>
                        <FormDescription>
                          Allow users to mark their attendance for this event
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="strictAttendance"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Strict Attendance
                        </FormLabel>
                        <FormDescription>
                          Enable strict attendance tracking requirements
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Ranklist Settings */}
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="text-lg font-medium">Ranklist Settings</h3>
              <FormField
                control={form.control}
                name="ranklists"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ranklists</FormLabel>
                    <FormDescription>
                      Select ranklists and assign weights for this event
                    </FormDescription>

                    {/* Display selected ranklists */}
                    <div className="space-y-2">
                      {field.value?.map((selectedRanklist, index) => {
                        const ranklist = activeRanklists.find(
                          (r) => r.id === selectedRanklist.id
                        );
                        return (
                          <div
                            key={selectedRanklist.id}
                            className="flex items-center gap-2 p-2 border rounded-lg"
                          >
                            <div className="flex-1">
                              <Badge variant="secondary">
                                {ranklist?.trackerTitle || "Unknown Tracker"} - {ranklist?.keyword}
                              </Badge>
                              {ranklist?.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {ranklist.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                step="0.1"
                                min="0.1"
                                max="10"
                                value={selectedRanklist.weight}
                                onChange={(e) => {
                                  const newValue = Number(e.target.value);
                                  const newRanklists = [...(field.value || [])];
                                  newRanklists[index] = {
                                    ...selectedRanklist,
                                    weight: newValue,
                                  };
                                  field.onChange(newRanklists);
                                }}
                                className="w-20"
                                placeholder="1.0"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newRanklists =
                                    field.value?.filter(
                                      (_, i) => i !== index
                                    ) || [];
                                  field.onChange(newRanklists);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add new ranklist */}
                    <Select
                      onValueChange={(value) => {
                        if (value !== "none") {
                          const ranklistId = Number(value);
                          const isAlreadySelected = field.value?.some(
                            (r) => r.id === ranklistId
                          );
                          if (!isAlreadySelected) {
                            const newRanklists = [
                              ...(field.value || []),
                              { id: ranklistId, weight: 1.0 },
                            ];
                            field.onChange(newRanklists);
                          }
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Add ranklist" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Select a ranklist</SelectItem>
                        {activeRanklists
                          .filter(
                            (ranklist) =>
                              !field.value?.some(
                                (selected) => selected.id === ranklist.id
                              )
                          )
                          .map((ranklist) => (
                            <SelectItem
                              key={ranklist.id}
                              value={ranklist.id.toString()}
                            >
                              {ranklist.trackerTitle || "Unknown Tracker"} - {ranklist.keyword}
                              {ranklist.description &&
                                ` (${ranklist.description})`}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/events")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : isEditing
                  ? "Update Event"
                  : "Create Event"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
