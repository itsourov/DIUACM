"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";

export function SearchProgrammers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 300);
  const previousDebouncedSearch = useRef(debouncedSearch);

  useEffect(() => {
    // Only update URL if the debounced search value actually changed
    if (previousDebouncedSearch.current !== debouncedSearch) {
      const params = new URLSearchParams(searchParams);
      
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      } else {
        params.delete("search");
      }
      
      // Reset to first page when search term changes
      params.delete("page");
      
      router.push(`/programmers?${params.toString()}`);
      previousDebouncedSearch.current = debouncedSearch;
    }
  }, [debouncedSearch, router, searchParams]);

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Search by name, student ID, or Codeforces handle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-10 w-full md:w-96"
        />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}