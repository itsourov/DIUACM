"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Search, Users, X } from "lucide-react";
import { User, RankListUser } from "@prisma/client";
import {
  searchUsersForRanklist,
  addUserToRanklist,
} from "@/app/admin/trackers/[id]/ranklists/[ranklistId]/users/actions";
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

type UserData = Pick<
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

// Define type for user with data
type UserWithData = RankListUser & {
  user: UserData;
};

interface AddUserDialogProps {
  ranklistId: string;
  onUserAdded?: (user: UserWithData) => void;
}

export function AddUserDialog({ ranklistId, onUserAdded }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<UserData[]>([]);

  const handleSearch = useCallback(
    async (query = debouncedSearch) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);
        const response = await searchUsersForRanklist(ranklistId, query);

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
    [debouncedSearch, ranklistId]
  );

  // Effect to trigger search when debounced search value changes
  useEffect(() => {
    if (debouncedSearch && debouncedSearch.trim().length >= 2) {
      handleSearch(debouncedSearch);
    }
  }, [debouncedSearch, handleSearch]);

  const handleAddUser = async (user: UserData) => {
    try {
      setIsAdding(user.id);
      // Initial score is 0
      const response = await addUserToRanklist(ranklistId, user.id);

      if (response.success) {
        toast.success("User added successfully");

        // Remove user from search results
        setSearchResults((prev) => prev.filter((item) => item.id !== user.id));

        // If it was the last item in the results, refresh the search
        if (searchResults.length === 1) {
          handleSearch();
        }

        // Call the callback function with the new user data
        if (onUserAdded && response.data) {
          onUserAdded(response.data);
        }
      } else {
        toast.error(response.error || "Failed to add user");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsAdding(null);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  // Reset search when dialog is opened
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [open]);

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Search for users to add to this ranklist
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users by name, email, or student ID (min. 2 characters)"
              className="pl-8 pr-10"
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
            {searchQuery && (
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
            {isSearching ? (
              <div className="divide-y">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
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
                    <div className="flex items-center gap-3">
                      <Avatar>
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
                        <div className="flex items-center mt-1 space-x-2 text-sm text-muted-foreground">
                          <span>{user.username}</span>
                          {user.studentId && <span>• {user.studentId}</span>}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddUser(user)}
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
