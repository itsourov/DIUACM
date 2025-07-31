"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

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

  const handleCategoryChange = (categoryId: string | null) => {
    updateFilters({ category: categoryId });
  };

  const handleSortChange = (sortBy: string) => {
    updateFilters({ sortBy });
  };

  const clearFilters = () => {
    setSearchValue("");
    router.push(pathname, { scroll: false });
  };

  const hasActiveFilters = currentCategory || searchParams.get("search");
  const selectedCategory = categories.find(
    (c) => c.id.toString() === currentCategory
  );

  const sortOptions = [
    { value: "latest", label: "Latest" },
    { value: "popular", label: "Popular" },
    { value: "trending", label: "Trending" },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </form>

        {/* Sort Dropdown */}
        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Categories and Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {selectedCategory ? selectedCategory.name : "All Categories"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuItem onClick={() => handleCategoryChange(null)}>
              <div className="flex items-center justify-between w-full">
                <span>All Categories</span>
                <Badge variant="secondary" className="ml-2">
                  {categories.reduce((sum, cat) => sum + cat.postCount, 0)}
                </Badge>
              </div>
            </DropdownMenuItem>
            {categories.map((category) => (
              <DropdownMenuItem
                key={category.id}
                onClick={() => handleCategoryChange(category.id.toString())}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color || "#6B7280" }}
                    />
                    <span>{category.name}</span>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {category.postCount}
                  </Badge>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            {selectedCategory && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleCategoryChange(null)}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: selectedCategory.color || "#6B7280",
                  }}
                />
                {selectedCategory.name}
                <span className="ml-1">×</span>
              </Badge>
            )}

            {searchParams.get("search") && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  setSearchValue("");
                  updateFilters({ search: null });
                }}
              >
                Search: &ldquo;{searchParams.get("search")}&rdquo;
                <span className="ml-1">×</span>
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
