import { EventAttendance, User } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Users } from "lucide-react";
import Image from "next/image";

type AttendeeWithUser = EventAttendance & {
  user: Pick<
    User,
    "id" | "name" | "username" | "image" | "department" | "studentId"
  >;
};

interface EventAttendanceListProps {
  attendees: AttendeeWithUser[];
}

export function EventAttendanceList({ attendees }: EventAttendanceListProps) {
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
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Users className="mr-2 h-5 w-5" />
          Attendees ({attendees.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attendees.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No attendees yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendees.map((attendee) => (
                  <TableRow key={attendee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {attendee.user.image && (
                            <Image
                              src={attendee.user.image}
                              alt={attendee.user.name}
                              width={40}
                              height={40}
                            />
                          )}

                          <AvatarFallback>
                            {getInitials(attendee.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {attendee.user.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{attendee.user.username}</TableCell>
                    <TableCell>{attendee.user.studentId || "—"}</TableCell>
                    <TableCell>{attendee.user.department || "—"}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {format(new Date(attendee.createdAt), "MMM d, h:mm a")}
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
