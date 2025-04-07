"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Filter,
  Tag,
  X,
  Search as SearchIcon,
  Users,
  SlidersHorizontal,
} from "lucide-react";
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
import { EventType, Visibility, AttendanceScope } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Define typed categories for filters
const EVENT_TYPES = [
  { id: EventType.CONTEST, name: "Contest", icon: "🏆" },
  { id: EventType.CLASS, name: "Class", icon: "📚" },
  { id: EventType.OTHER, name: "Other", icon: "📋" },
];

const STATUSES = [
  { id: Visibility.PUBLISHED, name: "Published" },
  { id: Visibility.DRAFT, name: "Draft" },
  { id: Visibility.PRIVATE, name: "Private" },
];

const ATTENDANCE_SCOPES = [
  { id: AttendanceScope.OPEN_FOR_ALL, name: "Open for All", icon: "👥" },
  { id: AttendanceScope.ONLY_GIRLS, name: "Girls Only", icon: "👩" },
  {
    id: AttendanceScope.JUNIOR_PROGRAMMERS,
    name: "Junior Programmers",
    icon: "🌱",
  },
  {
    id: AttendanceScope.SELECTED_PERSONS,
    name: "Selected Persons",
    icon: "✨",
  },
];

type EventFiltersProps = {
  initialFilters: {
    categoryId?: string;
    status?: string;
  };
};

export function EventFilters({ initialFilters }: EventFiltersProps) {
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

  // Count number of active filters for the badge
  const activeFiltersCount = [
    searchParams.get("category"),
    searchParams.get("status"),
    searchParams.get("title"),
    searchParams.get("scope"),
  ].filter(Boolean).length;

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
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <SearchIcon className="h-4 w-4" />
                </button>
              </form>
            </div>

            <div className="flex">
              {/* Mobile filter button */}
              <div className="md:hidden w-full">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="flex items-center">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Filters
                      </span>
                      {activeFiltersCount > 0 && (
                        <Badge className="ml-2 bg-primary text-primary-foreground">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Event Filters</SheetTitle>
                      <SheetDescription>
                        Filter events by type and more
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Event Type</h3>
                        <Select
                          value={searchParams.get("category") || "all"}
                          onValueChange={(value) =>
                            handleSelectChange(
                              "category",
                              value === "all" ? null : value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Event Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Event Types</SelectItem>
                            {EVENT_TYPES.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.icon} {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">
                          Attendance Scope
                        </h3>
                        <Select
                          value={searchParams.get("scope") || "all"}
                          onValueChange={(value) =>
                            handleSelectChange(
                              "scope",
                              value === "all" ? null : value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Attendance Scope" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Scopes</SelectItem>
                            {ATTENDANCE_SCOPES.map((scope) => (
                              <SelectItem key={scope.id} value={scope.id}>
                                {scope.icon} {scope.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Status</h3>
                        <Select
                          value={searchParams.get("status") || "all"}
                          onValueChange={(value) =>
                            handleSelectChange(
                              "status",
                              value === "all" ? null : value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {STATUSES.map((status) => (
                              <SelectItem key={status.id} value={status.id}>
                                {status.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {hasActiveFilters && (
                        <div className="pt-4">
                          <Button
                            variant="outline"
                            onClick={clearAllFilters}
                            className="w-full"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Clear all filters
                          </Button>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop filters */}
              <div className="hidden md:flex gap-2">
                <Select
                  value={searchParams.get("category") || "all"}
                  onValueChange={(value) =>
                    handleSelectChange(
                      "category",
                      value === "all" ? null : value
                    )
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center">
                      <Tag className="mr-2 h-4 w-4 text-slate-500" />
                      <SelectValue placeholder="Event Type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Event Types</SelectItem>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.icon} {type.name}
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
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-slate-500" />
                      <SelectValue placeholder="Attendance Scope" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scopes</SelectItem>
                    {ATTENDANCE_SCOPES.map((scope) => (
                      <SelectItem key={scope.id} value={scope.id}>
                        {scope.icon} {scope.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearAllFilters}
                    className="h-10 w-10"
                    title="Clear all filters"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-700">
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
              <button
                onClick={() => {
                  setSearchQuery("");
                  router.push(
                    `${pathname}?${createQueryString("title", null)}`
                  );
                }}
                className="ml-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {searchParams.get("category") && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {EVENT_TYPES.find((c) => c.id === searchParams.get("category"))
                ?.name || "Unknown"}
              <button
                onClick={() =>
                  router.push(
                    `${pathname}?${createQueryString("category", null)}`
                  )
                }
                className="ml-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/30 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {searchParams.get("scope") && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
            >
              {ATTENDANCE_SCOPES.find((s) => s.id === searchParams.get("scope"))
                ?.name || "Unknown"}
              <button
                onClick={() =>
                  router.push(`${pathname}?${createQueryString("scope", null)}`)
                }
                className="ml-1 rounded-full hover:bg-pink-200 dark:hover:bg-pink-800/30 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {searchParams.get("status") && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
            >
              {STATUSES.find((s) => s.id === searchParams.get("status"))
                ?.name || "Unknown"}
              <button
                onClick={() =>
                  router.push(
                    `${pathname}?${createQueryString("status", null)}`
                  )
                }
                className="ml-1 rounded-full hover:bg-orange-200 dark:hover:bg-orange-800/30 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="ml-auto text-xs h-7 px-2.5 py-1"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
