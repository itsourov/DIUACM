"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Users, Mail, IdCard, GraduationCap } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
import { AddMemberDialog } from "./add-member-dialog";
import { UserSearchResult } from "@/components/user-search-dialog";

type TeamMemberWithUser = {
  teamId: number;
  userId: string;
  user: UserSearchResult;
};

interface MembersListProps {
  teamId: number;
  initialMembers: TeamMemberWithUser[];
}

export function MembersList({ teamId, initialMembers }: MembersListProps) {
  const [members, setMembers] = useState<TeamMemberWithUser[]>(initialMembers);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleMemberAdded = (newMember: TeamMemberWithUser) => {
    setMembers((prev) => [newMember, ...prev]);
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      setIsDeleting(userId);
      const response = await removeTeamMember(teamId, userId);
      if (response.success) {
        setMembers(members.filter((item) => item.userId !== userId));
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center text-xl">
          <Users className="h-5 w-5 mr-2" />
          Team Members
          <Badge variant="secondary" className="ml-2">
            {members.length}
          </Badge>
        </CardTitle>
        <AddMemberDialog teamId={teamId} onMemberAdded={handleMemberAdded} />
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="rounded-full bg-muted p-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No team members yet</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-xs">
              Start building your team by adding members using the &quot;Add
              Member&quot; button above.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Academic Info</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((item) => (
                  <TableRow key={item.userId}>
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
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={isDeleting === item.userId}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove member</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Remove Team Member
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove{" "}
                              <strong>{item.user.name}</strong> from this team?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveMember(item.userId)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
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
