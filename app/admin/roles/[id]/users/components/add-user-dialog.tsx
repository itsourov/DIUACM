"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Search, User, X } from "lucide-react";
import { User as UserType } from "@prisma/client";
import { useDebounce } from "@/hooks/use-debounce";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { searchUsersForRole, addUserToRole } from "../actions";

type RoleUser = Pick<
  UserType,
  "id" | "name" | "email" | "username" | "image" | "studentId" | "department"
>;

interface AddUserDialogProps {
  roleId: string;
  onUserAdded: (user: RoleUser) => void;
}

export function AddUserDialog({ roleId, onUserAdded }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [users, setUsers] = useState<RoleUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!debouncedSearch || debouncedSearch.length < 3) return;

    setIsLoading(true);
    try {
      const response = await searchUsersForRole(roleId, debouncedSearch);
      if (response.success) {
        setUsers(response.data || []);
      } else {
        toast.error(response.error || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, roleId]);

  useEffect(() => {
    if (open && debouncedSearch.length >= 3) {
      fetchUsers();
    } else if (debouncedSearch.length === 0) {
      setUsers([]);
    }
  }, [debouncedSearch, open, fetchUsers]);

  // Reset search when dialog is opened
  useEffect(() => {
    if (open) {
      setSearch("");
      setUsers([]);
    }
  }, [open]);

  const handleAddUser = async (userId: string) => {
    setIsAdding(userId);
    try {
      const response = await addUserToRole(roleId, userId);
      if (response.success && response.data) {
        onUserAdded(response.data);
        // Remove user from search results
        setUsers(users.filter((user) => user.id !== userId));
        setOpen(false);
        toast.success("User added to role successfully");
      } else {
        toast.error(response.error || "Failed to add user to role");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsAdding(null);
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

  const clearSearch = () => {
    setSearch("");
    setUsers([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add User to Role</DialogTitle>
          <DialogDescription>
            Search for users to add to this role
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, email, or student ID (min. 3 characters)"
              className="pl-8 pr-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value === "") {
                  setUsers([]);
                }
              }}
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear</span>
              </Button>
            )}
          </div>

          <div className="border rounded-md">
            {isLoading ? (
              <div className="divide-y">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : users.length > 0 ? (
              <ScrollArea className="max-h-[300px]">
                <div className="divide-y">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 flex items-center justify-between"
                    >
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
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                            {user.studentId ? ` • ${user.studentId}` : ""}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddUser(user.id)}
                        disabled={isAdding === user.id}
                      >
                        {isAdding === user.id ? (
                          "Adding..."
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : search && search.length >= 3 ? (
              <div className="p-8 text-center">
                <User className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No users found
                </p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Type at least 3 characters to search for users
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
