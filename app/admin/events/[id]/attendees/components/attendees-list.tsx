"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Users, Mail, Hash, Building } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { removeEventAttendee } from "../actions";
import { AddAttendeeDialog } from "./add-attendee-dialog";

type UserData = {
    id: string;
    name: string;
    email: string;
    username?: string | null;
    image?: string | null;
    studentId?: string | null;
    department?: string | null;
};

type EventAttendeeWithUser = {
    eventId: number;
    userId: string;
    createdAt?: Date | null;
    user: UserData;
};

interface AttendeesListProps {
    eventId: number;
    eventTitle: string;
    initialAttendees: EventAttendeeWithUser[];
}

export function AttendeesList({ eventId, eventTitle, initialAttendees }: AttendeesListProps) {
    const [attendees, setAttendees] = useState<EventAttendeeWithUser[]>(initialAttendees);
    const [removingUserId, setRemovingUserId] = useState<string | null>(null);

    const handleRemoveAttendee = async (userId: string, userName: string) => {
        setRemovingUserId(userId);
        try {
            const result = await removeEventAttendee(eventId, userId);

            if (result.success) {
                toast.success(`${userName} has been removed from attendees`);
                setAttendees(prev => prev.filter(attendee => attendee.userId !== userId));
            } else {
                toast.error(result.error || "Failed to remove attendee");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setRemovingUserId(null);
        }
    };

    const handleAttendeeAdded = (newAttendee: EventAttendeeWithUser) => {
        setAttendees(prev => [...prev, newAttendee]);
    };

    // Function to create avatar initials from a name
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Event Attendees
                        <Badge variant="secondary" className="ml-2">
                            {attendees.length}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Manage attendees for {eventTitle}
                    </CardDescription>
                </div>
                <AddAttendeeDialog
                    eventId={eventId}
                    onAttendeeAdded={handleAttendeeAdded}
                />
            </CardHeader>
            <CardContent>
                {attendees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <div className="rounded-full bg-muted p-3">
                            <Users className="h-6 w-6" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No attendees yet</h3>
                        <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                            Start by adding users as attendees to this event.
                        </p>
                        <AddAttendeeDialog
                            eventId={eventId}
                            onAttendeeAdded={handleAttendeeAdded}
                        />
                    </div>
                ) : (
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[220px]">User Details</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Student Details</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendees.map((attendee) => (
                                    <TableRow key={`${attendee.eventId}-${attendee.userId}`}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage
                                                        src={attendee.user.image || ""}
                                                        alt={attendee.user.name}
                                                    />
                                                    <AvatarFallback>
                                                        {getInitials(attendee.user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{attendee.user.name}</div>
                                                    {attendee.user.username && (
                                                        <div className="text-sm text-muted-foreground">
                                                            @{attendee.user.username}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center text-sm">
                                                    <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                                                    {attendee.user.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {attendee.user.studentId && (
                                                    <div className="flex items-center">
                                                        <Hash className="h-3 w-3 mr-1 text-muted-foreground" />
                                                        <Badge variant="secondary" className="text-xs">
                                                            {attendee.user.studentId}
                                                        </Badge>
                                                    </div>
                                                )}
                                                {attendee.user.department && (
                                                    <div className="flex items-center mt-1">
                                                        <Building className="h-3 w-3 mr-1 text-muted-foreground" />
                                                        <Badge variant="outline" className="text-xs">
                                                            {attendee.user.department}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {attendee.createdAt ? (
                                                <div className="text-sm">
                                                    {format(new Date(attendee.createdAt), "MMM dd, yyyy")}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        disabled={removingUserId === attendee.userId}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remove Attendee</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to remove {attendee.user.name} from the event attendees?
                                                            This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleRemoveAttendee(attendee.userId, attendee.user.name)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            {removingUserId === attendee.userId ? "Removing..." : "Remove"}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 