"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Users, Edit } from "lucide-react";
import { RankListUser, User } from "@prisma/client";
import { removeUserFromRanklist } from "@/app/admin/trackers/[id]/ranklists/[ranklistId]/users/actions";
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
import { AddUserDialog } from "./add-user-dialog";
import { EditScoreDialog } from "./edit-score-dialog";

type UserWithData = RankListUser & {
  user: Pick<
    User,
    | "id"
    | "name"
    | "email"
    | "username"
    | "image"
    | "studentId"
    | "department"
    | "codeforcesHandle"
    | "atcoderHandle"
    | "vjudgeHandle"
  >;
};

interface UserListProps {
  ranklistId: string;
  initialUsers: UserWithData[];
}

export function UserList({ ranklistId, initialUsers }: UserListProps) {
  const [users, setUsers] = useState<UserWithData[]>(initialUsers);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserWithData | null>(null);

  const handleUserAdded = (newUser: UserWithData) => {
    setUsers((prev) => [...prev, newUser].sort((a, b) => b.score - a.score));
  };

  const handleRemoveUser = async (rankListUserId: string) => {
    try {
      setIsDeleting(rankListUserId);
      const response = await removeUserFromRanklist(rankListUserId, ranklistId);

      if (response.success) {
        setUsers(users.filter((item) => item.id !== rankListUserId));
        toast.success("User removed successfully");
      } else {
        toast.error(response.error || "Failed to remove user");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleScoreUpdated = (updatedUser: UserWithData) => {
    setUsers(
      [...users.filter((item) => item.id !== updatedUser.id), updatedUser].sort(
        (a, b) => b.score - a.score
      )
    );
    setEditingUser(null);
  };

  // Helper to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-xl">
          <Users className="h-5 w-5 mr-2" />
          Users ({users.length})
        </CardTitle>
        <AddUserDialog ranklistId={ranklistId} onUserAdded={handleUserAdded} />
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="rounded-full bg-muted p-3">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No users yet</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-xs">
              Start adding users to this ranklist using the &quot;Add User&quot;
              button.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Handles</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
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
                            {item.user.username}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.user.studentId ? (
                        <div className="flex flex-col">
                          <span>{item.user.studentId}</span>
                          {item.user.department && (
                            <span className="text-xs text-muted-foreground">
                              {item.user.department}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Not provided
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {item.user.codeforcesHandle && (
                          <div>CF: {item.user.codeforcesHandle}</div>
                        )}
                        {item.user.atcoderHandle && (
                          <div>AC: {item.user.atcoderHandle}</div>
                        )}
                        {item.user.vjudgeHandle && (
                          <div>VJ: {item.user.vjudgeHandle}</div>
                        )}
                        {!item.user.codeforcesHandle &&
                          !item.user.atcoderHandle &&
                          !item.user.vjudgeHandle && (
                            <span className="text-muted-foreground">
                              No handles
                            </span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {item.score.toFixed(2)}
                    </TableCell>
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
                          onClick={() => setEditingUser(item)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit Score</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          disabled={isDeleting === item.id}
                          onClick={() => handleRemoveUser(item.id)}
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

        {/* Score edit dialog */}
        {editingUser && (
          <EditScoreDialog
            ranklistId={ranklistId}
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onScoreUpdated={handleScoreUpdated}
          />
        )}
      </CardContent>
    </Card>
  );
}
