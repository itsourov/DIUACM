"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Users, Mail, IdCard, GraduationCap } from "lucide-react";
import { removeEventAttendee } from "../actions";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { AddAttendeeDialog } from "./add-attendee-dialog";

type AttendanceWithUser = {
  eventId: number;
  userId: string;
  createdAt?: Date | null;
  user: {
    id: string;
    name: string;
    email: string;
    username?: string | null;
    image?: string | null;
    studentId?: string | null;
    department?: string | null;
  };
};

interface AttendeesListProps {
  eventId: number;
  initialAttendees: AttendanceWithUser[];
}

export function AttendeesList({
  eventId,
  initialAttendees,
}: AttendeesListProps) {
  const [attendees, setAttendees] =
    useState<AttendanceWithUser[]>(initialAttendees);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleAttendeeAdded = (newAttendee: AttendanceWithUser) => {
    setAttendees((prev) => [newAttendee, ...prev]);
  };

  const handleRemoveAttendee = async (userId: string) => {
    try {
      setIsDeleting(userId);
      const response = await removeEventAttendee(eventId, userId);
      if (response.success) {
        setAttendees(attendees.filter((item) => item.userId !== userId));
        toast.success("Attendee removed successfully");
      } else {
        toast.error(response.error || "Failed to remove attendee");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-xl">
          <Users className="h-5 w-5 mr-2" />
          Attendees ({attendees.length})
        </CardTitle>
        <AddAttendeeDialog
          eventId={eventId}
          onAttendeeAdded={handleAttendeeAdded}
        />
      </CardHeader>
      <CardContent>
        {attendees.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="rounded-full bg-muted p-3">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No attendees yet</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-xs">
              Start adding attendees to this event using the &quot;Add
              Attendee&quot; button.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Academic Info</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendees.map((item) => (
                  <TableRow key={`${item.eventId}-${item.userId}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={item.user.image || undefined}
                            alt={item.user.name}
                          />
                          <AvatarFallback className="bg-primary/10">
                            {getInitials(item.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{item.user.name}</div>
                          {item.user.username && (
                            <div className="text-sm text-muted-foreground">
                              @{item.user.username}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {item.user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {item.user.studentId && (
                          <div className="flex items-center space-x-1 text-sm">
                            <IdCard className="h-3 w-3 text-muted-foreground" />
                            <span>{item.user.studentId}</span>
                          </div>
                        )}
                        {item.user.department && (
                          <div className="flex items-center space-x-1 text-sm">
                            <GraduationCap className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {item.user.department}
                            </span>
                          </div>
                        )}
                        {!item.user.studentId && !item.user.department && (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {item.createdAt
                        ? formatDistanceToNow(new Date(item.createdAt), {
                            addSuffix: true,
                          })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={isDeleting === item.userId}
                        onClick={() => handleRemoveAttendee(item.userId)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
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
