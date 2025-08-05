"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  description: string | null;
  postCount: number;
};

type ForumFiltersProps = {
  categories: Category[];
};

export function ForumFilters({ categories }: ForumFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || ""
  );

  const currentCategory = searchParams.get("category");
  const currentSort = searchParams.get("sortBy") || "latest";

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update or remove parameters
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchValue || null });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    updateFilters({ category: value || null });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ sortBy: e.target.value });
  };

  return (
    <div>
      {/* Single Row Layout */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 pr-12 h-11 w-full border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-900 transition-colors"
            />
            {searchValue && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => {
                  setSearchValue("");
                  updateFilters({ search: null });
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        </form>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 md:flex-shrink-0">
          {/* Category Select */}
          <select
            value={currentCategory || ""}
            onChange={handleCategoryChange}
            className="h-11 w-full sm:w-auto sm:min-w-[160px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 transition-all cursor-pointer"
          >
            <option value="">
              All Categories (
              {categories.reduce((sum, cat) => sum + cat.postCount, 0)})
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name} ({category.postCount})
              </option>
            ))}
          </select>

          {/* Sort Select */}
          <select
            value={currentSort}
            onChange={handleSortChange}
            className="h-11 w-full sm:w-auto sm:min-w-[120px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 transition-all cursor-pointer"
          >
            <option value="latest">Latest</option>
            <option value="popular">Popular</option>
            <option value="trending">Trending</option>
          </select>
        </div>
      </div>
    </div>
  );
}
