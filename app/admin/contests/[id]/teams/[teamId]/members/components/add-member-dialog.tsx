"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Search, UserPlus, X, Loader2 } from "lucide-react";
import { searchUsersForTeam, addTeamMember } from "../actions";
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
import { Badge } from "@/components/ui/badge";
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

// Define type for team member with user data
type TeamMemberWithUser = {
  teamId: number;
  userId: string;
  user: UserSearchResult;
};

interface AddMemberDialogProps {
  teamId: number;
  onMemberAdded?: (member: TeamMemberWithUser) => void;
}

export function AddMemberDialog({
  teamId,
  onMemberAdded,
}: AddMemberDialogProps) {
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
        const response = await searchUsersForTeam(teamId, query);
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
    [debouncedSearch, teamId]
  );

  // Effect to trigger search when debounced search value changes
  useEffect(() => {
    if (debouncedSearch && debouncedSearch.trim().length >= 2) {
      handleSearch(debouncedSearch);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch, handleSearch]);

  const handleAddMember = async (userId: string) => {
    try {
      setIsAdding(userId);
      const response = await addTeamMember(teamId, userId);
      if (response.success) {
        toast.success("Team member added successfully");
        // Remove user from search results
        setSearchResults((prev) => prev.filter((user) => user.id !== userId));
        // Refresh search if this was the only result
        if (searchResults.length === 1 && searchQuery.trim().length >= 2) {
          handleSearch(searchQuery);
        }
        // Call the callback function with the new team member data
        if (onMemberAdded && response.data) {
          onMemberAdded(response.data);
        }
      } else {
        toast.error(response.error || "Failed to add team member");
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

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim().length >= 2) {
      e.preventDefault();
      handleSearch(searchQuery);
    }
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
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Search for users to add to this team. You can search by name, email, username, or student ID.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users (min. 2 characters)..."
              className="pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value === "") {
                  setSearchResults([]);
                }
              }}
              onKeyDown={handleKeyDown}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>

          <div className="border rounded-lg bg-muted/30">
            {isSearching ? (
              <div className="divide-y">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-[320px] overflow-auto divide-y">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user.image || undefined}
                          alt={user.name}
                        />
                        <AvatarFallback className="bg-primary/10">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{user.name}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {user.studentId && (
                            <Badge variant="outline" className="text-xs">
                              {user.studentId}
                            </Badge>
                          )}
                          {user.department && (
                            <Badge variant="secondary" className="text-xs">
                              {user.department}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddMember(user.id)}
                      disabled={isAdding === user.id}
                      className="ml-3"
                    >
                      {isAdding === user.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                          Adding...
                        </>
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
            ) : searchQuery && searchQuery.length >= 2 && !isSearching ? (
              <div className="p-12 text-center">
                <div className="rounded-full bg-muted p-3 mx-auto w-fit">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  No users found matching &quot;{searchQuery}&quot;
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try adjusting your search terms
                </p>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="rounded-full bg-muted p-3 mx-auto w-fit">
                  <UserPlus className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Start typing to search for users
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Search by name, email, username, or student ID
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
