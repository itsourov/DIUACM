"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { EventType } from "@/db/schema";

export function SearchEvents() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("search") || "";
  const initialType = searchParams.get("type") || "ALL";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [eventType, setEventType] = useState(initialType);
  const debouncedSearch = useDebounce(searchQuery, 500);

  const prevSearch = useRef(initialQuery);
  const prevType = useRef(initialType);

  const updateSearchParams = useCallback(
    (query: string, type: string) => {
      // Only update if search or type actually changed
      if (prevSearch.current === query && prevType.current === type) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      // Reset to page 1 when search changes
      params.delete("page");

      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }

      if (type && type !== "ALL") {
        params.set("type", type);
      } else {
        params.delete("type");
      }

      prevSearch.current = query;
      prevType.current = type;
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Update URL when debounced search changes
  useEffect(() => {
    updateSearchParams(debouncedSearch, eventType);
  }, [debouncedSearch, eventType, updateSearchParams]);

  const handleClear = () => {
    setSearchQuery("");
    setEventType("ALL");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search events by title, description, or link..."
          className="pl-8 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-7 w-7 p-0"
            onClick={handleClear}
          >
            <span className="sr-only">Clear</span>
            <span aria-hidden="true">&times;</span>
          </Button>
        )}
      </div>

      <Select value={eventType} onValueChange={setEventType}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Types</SelectItem>
          {Object.values(EventType).map((type) => (
            <SelectItem key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
