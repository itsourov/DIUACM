"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Search, List, Hash } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";

export type RanklistSearchResult = {
  id: number;
  keyword: string;
  description?: string | null;
  trackerId: number;
  tracker: {
    title: string;
  } | null;
};

export type AddRanklistResponse = {
  success: boolean;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
};

interface RanklistSearchDialogProps {
  // Required props
  triggerLabel: string;
  dialogTitle: string;
  dialogDescription: string;
  buttonLabel: string;
  loadingLabel: string;
  successMessage: string;

  // Functions
  searchRanklists: (query: string) => Promise<AddRanklistResponse>;
  addRanklist: (ranklistId: number) => Promise<AddRanklistResponse>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRanklistAdded?: (data?: any) => void;

  // Optional customization
  triggerIcon?: React.ReactNode;
  buttonIcon?: React.ReactNode;
}

export function RanklistSearchDialog({
  triggerLabel,
  dialogTitle,
  dialogDescription,
  buttonLabel,
  loadingLabel,
  successMessage,
  searchRanklists,
  addRanklist,
  onRanklistAdded,
  triggerIcon = <List className="h-4 w-4 mr-2" />,
  buttonIcon = <Plus className="h-3.5 w-3.5 mr-1" />,
}: RanklistSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<RanklistSearchResult[]>(
    []
  );

  const handleSearch = useCallback(
    async (query = debouncedSearch) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        setIsSearching(true);
        const response = await searchRanklists(query);
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
    [searchRanklists, debouncedSearch]
  );

  useEffect(() => {
    if (debouncedSearch) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch, handleSearch]);

  const handleAddRanklist = async (ranklistId: number) => {
    try {
      setIsAdding(ranklistId);
      const response = await addRanklist(ranklistId);
      if (response.success) {
        toast.success(successMessage);
        // Remove ranklist from search results
        setSearchResults((prev) =>
          prev.filter((ranklist) => ranklist.id !== ranklistId)
        );
        if (searchResults.length === 1) {
          handleSearch();
        }
        // Call the callback function with the response data
        onRanklistAdded?.(response.data);
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

  const clearSearchAndClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          {triggerIcon}
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by keyword or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((ranklist) => (
                  <div
                    key={ranklist.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Hash className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {ranklist.tracker?.title
                            ? `${ranklist.tracker.title} - (${ranklist.keyword})`
                            : ranklist.keyword}
                        </div>
                        {ranklist.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {ranklist.description.length > 50
                              ? `${ranklist.description.substring(0, 50)}...`
                              : ranklist.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddRanklist(ranklist.id)}
                      disabled={isAdding === ranklist.id}
                    >
                      {isAdding === ranklist.id ? (
                        loadingLabel
                      ) : (
                        <>
                          {buttonIcon}
                          {buttonLabel}
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No ranklists found for &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Type at least 2 characters to search
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={clearSearchAndClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
