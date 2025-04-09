"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from 'nextjs-toploader/app';

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
import { Visibility } from "@prisma/client";

export function SearchBlogs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("search") || "";
  const initialStatus = searchParams.get("status") || "ALL";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [blogStatus, setBlogStatus] = useState(initialStatus);
  const debouncedSearch = useDebounce(searchQuery, 500);

  const prevSearch = useRef(initialQuery);
  const prevStatus = useRef(initialStatus);

  const updateSearchParams = useCallback(
    (query: string, status: string) => {
      // Only update if search or status actually changed
      if (prevSearch.current === query && prevStatus.current === status) {
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

      if (status && status !== "ALL") {
        params.set("status", status);
      } else {
        params.delete("status");
      }

      prevSearch.current = query;
      prevStatus.current = status;
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Update URL when debounced search changes
  useEffect(() => {
    updateSearchParams(debouncedSearch, blogStatus);
  }, [debouncedSearch, blogStatus, updateSearchParams]);

  const handleClear = () => {
    setSearchQuery("");
    setBlogStatus("ALL");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search blogs by title, content, or author..."
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

      <Select value={blogStatus} onValueChange={setBlogStatus}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          {Object.values(Visibility).map((status) => (
            <SelectItem key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
