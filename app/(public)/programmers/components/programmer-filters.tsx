"use client";

import { useCallback, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ProgrammerFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Current search value from URL
  const currentName = searchParams.get("name") || "";

  // Local state for search
  const [searchQuery, setSearchQuery] = useState(currentName);

  // Track the previous search to prevent unnecessary URL updates
  const prevSearch = useRef(currentName);

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

    // Only update if the search has actually changed
    if (prevSearch.current === searchQuery) {
      return;
    }

    const queryString = createQueryString("name", searchQuery || null);
    prevSearch.current = searchQuery;
    router.push(`${pathname}?${queryString}`);
  };

  // Handle clear
  const handleClear = () => {
    if (searchQuery) {
      setSearchQuery("");
      prevSearch.current = "";
      router.push(pathname);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
      <div>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="name-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search programmers by name..."
            className="pl-9 pr-10"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 mr-1"
                onClick={handleClear}
              >
                <span className="sr-only">Clear</span>
                <span aria-hidden="true">&times;</span>
              </Button>
            )}
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <span className="sr-only">Search</span>
              <Search className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
