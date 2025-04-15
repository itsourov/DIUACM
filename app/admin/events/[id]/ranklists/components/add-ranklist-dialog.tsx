"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Search, Medal, X } from "lucide-react";
import { EventRankList, RankList, Tracker } from "@prisma/client";
import {
  searchRanklistsForEvent,
  addRanklistToEvent,
} from "@/app/admin/events/[id]/ranklists/actions";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";

type RankListData = RankList & {
  tracker: Tracker;
};

type RankListWithData = EventRankList & {
  rankList: RankListData;
};

interface AddRanklistDialogProps {
  eventId: number;
  onRanklistAdded?: (ranklist: RankListWithData) => void;
}

export function AddRanklistDialog({
  eventId,
  onRanklistAdded,
}: AddRanklistDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<RankListData[]>([]);

  const handleSearch = useCallback(
    async (query = debouncedSearch) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);
        const response = await searchRanklistsForEvent(eventId, query);

        if (response.success && response.data) {
          setSearchResults(response.data);
        } else {
          toast.error(response.error || "Failed to search ranklists");
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
    [debouncedSearch, eventId]
  );

  // Effect to trigger search when debounced search value changes
  useEffect(() => {
    if (debouncedSearch && debouncedSearch.trim().length >= 2) {
      handleSearch(debouncedSearch);
    }
  }, [debouncedSearch, handleSearch]);

  const handleAddRanklist = async (ranklist: RankListData) => {
    try {
      setIsAdding(ranklist.id);
      // Always use default weight of 1.0
      const response = await addRanklistToEvent(eventId, ranklist.id);

      if (response.success) {
        toast.success("Ranklist added successfully");

        // Remove ranklist from search results
        setSearchResults((prev) =>
          prev.filter((item) => item.id !== ranklist.id)
        );

        // If it was the last item in the results, refresh the search
        if (searchResults.length === 1) {
          handleSearch();
        }

        // Call the callback function with the new ranklist data
        if (onRanklistAdded && response.data) {
          onRanklistAdded(response.data);
        }
      } else {
        toast.error(response.error || "Failed to add ranklist");
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Medal className="h-4 w-4 mr-2" />
          Add Ranklist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Ranklist</DialogTitle>
          <DialogDescription>
            Search for ranklists to add to this event
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search ranklists by keyword or tracker (min. 2 characters)"
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
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-[300px] overflow-auto divide-y">
                {searchResults.map((ranklist) => (
                  <div
                    key={ranklist.id}
                    className="p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{ranklist.keyword}</div>
                      <div className="flex items-center mt-1 space-x-2">
                        <Badge variant="outline">
                          {ranklist.tracker.title}
                        </Badge>
                        {ranklist.description && (
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {ranklist.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddRanklist(ranklist)}
                      disabled={isAdding === ranklist.id}
                    >
                      {isAdding === ranklist.id ? (
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
                  No ranklists found matching your search
                </p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Type at least 2 characters to search for ranklists
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
