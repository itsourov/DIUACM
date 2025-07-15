"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EventType, ParticipationScope, VisibilityStatus } from "@/db/schema";

import { eventFormSchema, type EventFormValues } from "../schemas/event";
import { createEvent, updateEvent } from "../actions";

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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Calendar, Link, Users } from "lucide-react";

interface Event {
    id: number;
    title: string;
    description?: string | null;
    status: VisibilityStatus;
    startingAt: Date;
    endingAt: string;
    eventLink?: string | null;
    eventPassword?: string | null;
    openForAttendance: boolean;
    strictAttendance: boolean;
    type: EventType;
    participationScope: ParticipationScope;
    createdAt?: Date | null;
    updatedAt?: Date | null;
}

interface EventFormProps {
    initialData?: Event;
    isEditing?: boolean;
}

export function EventForm({ initialData, isEditing = false }: EventFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: initialData
            ? {
                title: initialData.title,
                description: initialData.description || "",
                status: initialData.status,
                startingAt: initialData.startingAt.toISOString().slice(0, 16),
                endingAt: initialData.endingAt,
                eventLink: initialData.eventLink || "",
                eventPassword: initialData.eventPassword || "",
                openForAttendance: initialData.openForAttendance,
                strictAttendance: initialData.strictAttendance,
                type: initialData.type,
                participationScope: initialData.participationScope,
            }
            : {
                title: "",
                description: "",
                status: VisibilityStatus.DRAFT,
                startingAt: "",
                endingAt: "",
                eventLink: "",
                eventPassword: "",
                openForAttendance: true,
                strictAttendance: false,
                type: EventType.CONTEST,
                participationScope: ParticipationScope.OPEN_FOR_ALL,
            },
    });

    const onSubmit = async (values: EventFormValues) => {
        setIsLoading(true);
        try {
            let result;
            if (isEditing && initialData?.id) {
                result = await updateEvent(initialData.id, values);
            } else {
                result = await createEvent(values);
            }

            if (result.success) {
                toast.success(
                    isEditing ? "Event updated successfully!" : "Event created successfully!"
                );
                router.push("/admin/events");
            } else {
                toast.error(result.error || "Something went wrong");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {isEditing ? "Edit Event" : "Create New Event"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Basic Information</h3>

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
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
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={VisibilityStatus.DRAFT}>Draft</SelectItem>
                                                <SelectItem value={VisibilityStatus.PUBLISHED}>Published</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Event Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Event Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startingAt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Starting Time</FormLabel>
                                            <FormControl>
                                                <Input type="datetime-local" {...field} />
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
                                            <FormLabel>Ending Time</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., 3 hours" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Duration or end time (e.g., &quot;3 hours&quot;, &quot;2024-12-31 18:00&quot;)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select event type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={EventType.CONTEST}>Contest</SelectItem>
                                                <SelectItem value={EventType.CLASS}>Class</SelectItem>
                                                <SelectItem value={EventType.OTHER}>Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="participationScope"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Participation Scope</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select participation scope" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={ParticipationScope.OPEN_FOR_ALL}>Open for All</SelectItem>
                                                <SelectItem value={ParticipationScope.ONLY_GIRLS}>Only Girls</SelectItem>
                                                <SelectItem value={ParticipationScope.JUNIOR_PROGRAMMERS}>Junior Programmers</SelectItem>
                                                <SelectItem value={ParticipationScope.SELECTED_PERSONS}>Selected Persons</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Event Links */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <Link className="h-5 w-5" />
                                Event Links & Access
                            </h3>

                            <FormField
                                control={form.control}
                                name="eventLink"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Link</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="https://example.com/contest"
                                                type="url"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Link to the contest platform or event page (optional)
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
                                                placeholder="Password for the event (optional)"
                                                type="password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Password required to access the event (if any)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Attendance Settings */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Attendance Settings
                            </h3>

                            <FormField
                                control={form.control}
                                name="openForAttendance"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Open for Attendance</FormLabel>
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
                                            <FormLabel className="text-base">Strict Attendance</FormLabel>
                                            <FormDescription>
                                                Require attendance verification or specific conditions
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

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/admin/events")}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : isEditing ? "Update Event" : "Create Event"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
} 