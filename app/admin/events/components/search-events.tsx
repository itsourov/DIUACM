"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

export function SearchEvents() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        if (debouncedSearchTerm) {
            params.set("search", debouncedSearchTerm);
        } else {
            params.delete("search");
        }

        // Reset to page 1 when searching
        params.delete("page");

        router.push(`/admin/events?${params.toString()}`);
    }, [debouncedSearchTerm, router, searchParams]);

    const clearSearch = () => {
        setSearchTerm("");
    };

    return (
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-9"
            />
            {searchTerm && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
} 