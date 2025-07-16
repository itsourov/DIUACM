"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Search, UserPlus } from "lucide-react";
import { searchUsersForRole, assignUserToRole } from "../actions";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";

type UserSearchResult = {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  image?: string | null;
  studentId?: string | null;
  department?: string | null;
};

// Define type for role user with user data
type RoleUserWithUser = {
  roleId: number;
  userId: string;
  user: UserSearchResult;
};

interface AddUserDialogProps {
  roleId: number;
  onUserAdded?: (user: RoleUserWithUser) => void;
}

export function AddUserDialog({ roleId, onUserAdded }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);

  const handleSearch = useCallback(
    async (query = debouncedSearch) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        setIsSearching(true);
        const response = await searchUsersForRole(roleId, query);
        if (response.success && response.data) {
          setSearchResults(response.data);
        } else {
          toast.error(response.error || "Failed to search users");
          setSearchResults([]);
        }
      } catch (error) {
        console.error(error);
        toast.error("An unexpected error occurred while searching");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [debouncedSearch, roleId, setIsSearching, setSearchResults]
  );

  // Effect to trigger search when debounced search value changes
  useEffect(() => {
    if (debouncedSearch && debouncedSearch.trim().length >= 2) {
      handleSearch(debouncedSearch);
    }
  }, [debouncedSearch, handleSearch]);

  const handleAssignUser = async (userId: string) => {
    try {
      setIsAdding(userId);
      const response = await assignUserToRole(roleId, userId);
      if (response.success) {
        toast.success("User assigned to role successfully");
        // Remove user from search results
        setSearchResults((prev) => prev.filter((user) => user.id !== userId));
        if (searchResults.length === 1) {
          handleSearch();
        }
        // Call the callback function with the new role user data
        if (onUserAdded && response.data) {
          onUserAdded(response.data);
        }
      } else {
        toast.error(response.error || "Failed to assign user to role");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
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

  // Reset search when dialog is opened
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Assign User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign User to Role</DialogTitle>
          <DialogDescription>
            Search for users to assign to this role
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users by name, email, or ID (min. 2 characters)"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value === "") {
                  setSearchResults([]);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim().length >= 2) {
                  handleSearch(searchQuery);
                }
              }}
            />
          </div>
          <div className="border rounded-md">
            {isSearching ? (
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
            ) : searchResults.length > 0 ? (
              <div className="max-h-[300px] overflow-auto divide-y">
                {searchResults.map((user) => (
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
                          {user.email} {user.studentId && `• ${user.studentId}`}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAssignUser(user.id)}
                      disabled={isAdding === user.id}
                    >
                      {isAdding === user.id ? (
                        "Assigning..."
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Assign
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchQuery && searchQuery.length >= 2 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No users found matching your search
                </p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Type at least 2 characters to search for users
                </p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
