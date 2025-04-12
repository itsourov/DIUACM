"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

export function ProgrammerFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Current search value from URL
  const currentName = searchParams.get("name") || "";

  // Local state for search
  const [name, setName] = useState(currentName);

  // Debounce name search to avoid too many URL updates
  const debouncedName = useDebounce(name, 500);

  // Update URL with search
  useEffect(() => {
    // Create a new URLSearchParams object
    const params = new URLSearchParams(searchParams);

    // Update or remove name parameter
    if (debouncedName) {
      params.set("name", debouncedName);
    } else {
      params.delete("name");
    }

    // Reset to page 1 when search changes
    params.delete("page");

    // Update the URL
    router.push(`/programmers?${params.toString()}`);
  }, [debouncedName, router, searchParams]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
      <div>
        {/* Name Search */}
        <div>
          <label
            htmlFor="name-search"
            className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block"
          >
            Search Programmers
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="name-search"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Search programmers by name..."
              className="pl-9"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
