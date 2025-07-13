"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from 'nextjs-toploader/app';

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

export function SearchUsers() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const prevSearch = useRef(initialQuery);

  const updateSearchParams = useCallback(
    (query: string) => {
      // Only update if search actually changed
      if (prevSearch.current === query) {
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

      prevSearch.current = query;
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Update URL when debounced search changes
  useEffect(() => {
    updateSearchParams(debouncedSearch);
  }, [debouncedSearch, updateSearchParams]);

  const handleClear = () => {
    setSearchQuery("");
  };

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search users by name, email, username..."
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
  );
}
