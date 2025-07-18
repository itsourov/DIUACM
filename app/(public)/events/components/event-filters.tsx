"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";

import { useCallback, useEffect, useState } from "react";
import { Filter, Tag, X, Search as SearchIcon, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EventType, VisibilityStatus, ParticipationScope } from "@/db/schema";
import { Card, CardContent } from "@/components/ui/card";

// Helper function to get event type icon
const getEventTypeIcon = (type: string): string => {
  switch (type) {
    case EventType.CONTEST:
      return "🏆";
    case EventType.CLASS:
      return "📚";
    case EventType.OTHER:
      return "📋";
    default:
      return "📋";
  }
};

// Helper function to format name nicely
const formatName = (name: string): string => {
  return name
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

// Helper function to get attendance scope icon
const getAttendanceScopeIcon = (scope: string): string => {
  switch (scope) {
    case ParticipationScope.OPEN_FOR_ALL:
      return "👥";
    case ParticipationScope.ONLY_GIRLS:
      return "👩";
    case ParticipationScope.JUNIOR_PROGRAMMERS:
      return "🌱";
    case ParticipationScope.SELECTED_PERSONS:
      return "✨";
    default:
      return "👥";
  }
};

// Define typed categories for filters - using const objects
const EVENT_TYPES = Object.values(EventType).map((type) => ({
  id: type,
  name: formatName(type),
  icon: getEventTypeIcon(type),
}));

const STATUSES = Object.values(VisibilityStatus).map((status) => ({
  id: status,
  name: formatName(status),
}));

const ATTENDANCE_SCOPES = Object.values(ParticipationScope).map((scope) => ({
  id: scope,
  name: formatName(scope),
  icon: getAttendanceScopeIcon(scope),
}));

export function EventFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State for search input
  const [searchQuery, setSearchQuery] = useState("");

  // Track if we have any active filters
  const hasActiveFilters = !!(
    searchParams.get("category") ||
    searchParams.get("status") ||
    searchParams.get("title") ||
    searchParams.get("scope")
  );

  // Create a new URLSearchParams instance to manipulate
  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset pagination when applying new filters
      params.delete("page");

      // Set or delete parameter
      if (value === null) {
        params.delete(name);
      } else {
        params.set(name, value);
      }

      return params.toString();
    },
    [searchParams]
  );

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryString = createQueryString("title", searchQuery || null);
    router.push(`${pathname}?${queryString}`);
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string | null) => {
    const queryString = createQueryString(name, value);
    router.push(`${pathname}?${queryString}`);
  };

  // Initialize search field from URL parameters
  useEffect(() => {
    const title = searchParams.get("title");
    if (title) {
      setSearchQuery(title);
    }
  }, [searchParams]);

  // Clear all filters
  const clearAllFilters = () => {
    router.push(pathname);
    setSearchQuery("");
  };

  return (
    <div>
      {/* Primary filters with search */}
      <Card className="border-slate-200 dark:border-slate-700 mb-4">
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Redesigned filter layout - row for desktop, column for mobile */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Search takes more space on desktop */}
              <div className="w-full md:flex-1">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 w-full"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <SearchIcon className="h-4 w-4" />
                  </button>
                </form>
              </div>

              {/* Filter selects in a row */}
              <div className="flex flex-wrap gap-2">
                <Select
                  value={searchParams.get("category") || "all"}
                  onValueChange={(value) =>
                    handleSelectChange(
                      "category",
                      value === "all" ? null : value
                    )
                  }
                >
                  <SelectTrigger className="w-[160px] md:w-[180px]">
                    <div className="flex items-center overflow-hidden">
                      <Tag className="mr-2 h-4 w-4 flex-shrink-0 text-slate-500" />
                      <SelectValue
                        className="truncate"
                        placeholder="Event Type"
                      />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    <SelectItem value="all">All Event Types</SelectItem>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem
                        key={type.id}
                        value={type.id}
                        className="truncate"
                      >
                        <span className="flex items-center max-w-full">
                          <span className="mr-1">{type.icon}</span>
                          <span className="truncate">{type.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={searchParams.get("scope") || "all"}
                  onValueChange={(value) =>
                    handleSelectChange("scope", value === "all" ? null : value)
                  }
                >
                  <SelectTrigger className="w-[160px] md:w-[180px]">
                    <div className="flex items-center overflow-hidden">
                      <Users className="mr-2 h-4 w-4 flex-shrink-0 text-slate-500" />
                      <SelectValue className="truncate" placeholder="Scope" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    <SelectItem value="all">All Scopes</SelectItem>
                    {ATTENDANCE_SCOPES.map((scope) => (
                      <SelectItem
                        key={scope.id}
                        value={scope.id}
                        className="truncate"
                      >
                        <span className="flex items-center max-w-full">
                          <span className="mr-1">{scope.icon}</span>
                          <span className="truncate">{scope.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center mr-1">
                <Filter className="mr-1 h-3 w-3" />
                Filters:
              </span>

              {searchParams.get("title") && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {`"${searchParams.get("title")}"`}
                </Badge>
              )}

              {searchParams.get("category") && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {EVENT_TYPES.find(
                    (c) => c.id === searchParams.get("category")
                  )?.name || "Unknown"}
                </Badge>
              )}

              {searchParams.get("scope") && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
                >
                  {ATTENDANCE_SCOPES.find(
                    (s) => s.id === searchParams.get("scope")
                  )?.name || "Unknown"}
                </Badge>
              )}

              {searchParams.get("status") && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                >
                  {STATUSES.find((s) => s.id === searchParams.get("status"))
                    ?.name || "Unknown"}
                </Badge>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-7 text-xs py-1 px-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              title="Clear all filters"
            >
              <X className="mr-1 h-3 w-3" />
              Clear all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
