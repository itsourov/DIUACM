"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Users } from "lucide-react";
import { RankListUser, User } from "@prisma/client";
import { removeRanklistUser } from "../actions";
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

type RanklistUserWithUser = RankListUser & {
  user: Pick<
    User,
    "id" | "name" | "email" | "username" | "image" | "studentId" | "department"
  >;
};

interface UsersListProps {
  ranklistId: string;
  initialUsers: RanklistUserWithUser[];
}

export function UsersList({ ranklistId, initialUsers }: UsersListProps) {
  const [users, setUsers] = useState<RanklistUserWithUser[]>(initialUsers);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleUserAdded = (newUser: RanklistUserWithUser) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      setIsDeleting(userId);
      const response = await removeRanklistUser(userId, ranklistId);
      if (response.success) {
        setUsers((prev) => prev.filter((item) => item.userId !== userId));
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
          Ranklist Users ({users.length})
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
                  <TableHead>Department</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((item) => (
                  <TableRow key={item.userId}>
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
                        disabled={isDeleting === item.userId}
                        onClick={() => handleRemoveUser(item.userId)}
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
