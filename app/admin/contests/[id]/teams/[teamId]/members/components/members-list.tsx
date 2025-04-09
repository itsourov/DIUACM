"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Users } from "lucide-react";
import { TeamMember, User } from "@prisma/client";
import { removeTeamMember } from "../actions";
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
import { AddMemberDialog } from "./add-member-dialog";

type TeamMemberWithUser = TeamMember & {
  user: Pick<
    User,
    "id" | "name" | "email" | "username" | "image" | "studentId" | "department"
  >;
};

interface MembersListProps {
  teamId: string;
  initialMembers: TeamMemberWithUser[];
}

export function MembersList({ teamId, initialMembers }: MembersListProps) {
  const [members, setMembers] = useState<TeamMemberWithUser[]>(initialMembers);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleMemberAdded = (newMember: TeamMemberWithUser) => {
    setMembers((prev) => [newMember, ...prev]);
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      setIsDeleting(memberId);
      const response = await removeTeamMember(memberId, teamId);
      if (response.success) {
        setMembers(members.filter((item) => item.id !== memberId));
        toast.success("Team member removed successfully");
      } else {
        toast.error(response.error || "Failed to remove team member");
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
          Team Members ({members.length})
        </CardTitle>
        <AddMemberDialog teamId={teamId} onMemberAdded={handleMemberAdded} />
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="rounded-full bg-muted p-3">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No team members yet</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-xs">
              Start adding members to this team using the &quot;Add Member&quot; button.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={item.user.image || undefined}
                            alt={item.user.name}
                          />
                          <AvatarFallback>
                            {getInitials(item.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{item.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.user.studentId || "—"}</TableCell>
                    <TableCell>{item.user.department || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive"
                        disabled={isDeleting === item.id}
                        onClick={() => handleRemoveMember(item.id)}
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
