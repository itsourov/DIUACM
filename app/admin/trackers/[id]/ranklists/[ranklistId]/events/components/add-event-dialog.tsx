"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Search, CalendarDays, X } from "lucide-react";
import { Event, EventRankList } from "@prisma/client";
import {
  searchEventsForRanklist,
  addEventToRanklist,
} from "@/app/admin/trackers/[id]/ranklists/[ranklistId]/events/actions";
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
import { format } from "date-fns";

type EventData = Event;

// Define type for event with data
type EventWithData = EventRankList & {
  event: EventData;
};

interface AddEventDialogProps {
  ranklistId: string;
  onEventAdded?: (event: EventWithData) => void;
}

export function AddEventDialog({
  ranklistId,
  onEventAdded,
}: AddEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<EventData[]>([]);

  const handleSearch = useCallback(
    async (query = debouncedSearch) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);
        const response = await searchEventsForRanklist(ranklistId, query);

        if (response.success && response.data) {
          setSearchResults(response.data);
        } else {
          toast.error(response.error || "Failed to search events");
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

  const handleAddEvent = async (event: EventData) => {
    try {
      setIsAdding(event.id);
      // Always use default weight of 1.0
      const response = await addEventToRanklist(ranklistId, event.id);

      if (response.success) {
        toast.success("Event added successfully");

        // Remove event from search results
        setSearchResults((prev) => prev.filter((item) => item.id !== event.id));

        // If it was the last item in the results, refresh the search
        if (searchResults.length === 1) {
          handleSearch();
        }

        // Call the callback function with the new event data
        if (onEventAdded && response.data) {
          onEventAdded(response.data);
        }
      } else {
        toast.error(response.error || "Failed to add event");
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

  function getStatusBadge(status: string) {
    switch (status) {
      case "PUBLISHED":
        return <Badge>Published</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "PRIVATE":
        return <Badge variant="outline">Private</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CalendarDays className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
          <DialogDescription>
            Search for events to add to this ranklist
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events by title (min. 2 characters)"
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
                {searchResults.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="flex items-center mt-1 space-x-2">
                        {getStatusBadge(event.status)}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(event.startingAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddEvent(event)}
                      disabled={isAdding === event.id}
                    >
                      {isAdding === event.id ? (
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
                  No events found matching your search
                </p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Type at least 2 characters to search for events
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
