"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Users } from "lucide-react";
import { User } from "@prisma/client";
import { removeUserFromRole } from "../actions";
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
import { AddUserDialog } from "./add-user-dialog";

type RoleUser = Pick<
  User,
  "id" | "name" | "email" | "username" | "image" | "studentId" | "department"
>;

interface UsersListProps {
  roleId: string;
  initialUsers: RoleUser[];
}

export function UsersList({ roleId, initialUsers }: UsersListProps) {
  const [users, setUsers] = useState<RoleUser[]>(initialUsers);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleUserAdded = (newUser: RoleUser) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      setIsDeleting(userId);
      const response = await removeUserFromRole(roleId, userId);
      if (response.success) {
        setUsers(users.filter((user) => user.id !== userId));
        toast.success("User removed from role successfully");
      } else {
        toast.error(response.error || "Failed to remove user from role");
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
          Role Users ({users.length})
        </CardTitle>
        <AddUserDialog roleId={roleId} onUserAdded={handleUserAdded} />
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="rounded-full bg-muted p-3">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              No users assigned to this role
            </h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-xs">
              Start adding users to this role using the &quot;Add User&quot;
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
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.image || undefined}
                            alt={user.name}
                          />
                          <AvatarFallback>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.studentId || "—"}</TableCell>
                    <TableCell>{user.department || "—"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive"
                        disabled={isDeleting === user.id}
                        onClick={() => handleRemoveUser(user.id)}
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
