"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { UserPlus, Search, X, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { getAvailableUsers, attachUserToRanklist } from "../../../actions";

interface User {
    id: string;
    name: string;
    email: string;
    username?: string | null;
    image?: string | null;
    studentId?: string | null;
    department?: string | null;
}

interface AttachUserDialogProps {
    ranklistId: number;
    onSuccess?: () => void;
}

export function AttachUserDialog({ ranklistId, onSuccess }: AttachUserDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [isSearching, setIsSearching] = useState(false);
    const [isAttaching, setIsAttaching] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [userScores, setUserScores] = useState<Record<string, string>>({});

    const handleSearch = useCallback(
        async (query = debouncedSearch) => {
            if (!query.trim() || query.length < 2) {
                setSearchResults([]);
                return;
            }
            try {
                setIsSearching(true);
                const response = await getAvailableUsers(ranklistId, query);
                if (response.success && response.data) {
                    setSearchResults(response.data as User[]);
                } else {
                    toast.error(response.error || "Failed to search users");
                    setSearchResults([]);
                }
            } catch (error) {
                console.error(error);
                toast.error("An unexpected error occurred while searching");
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        },
        [debouncedSearch, ranklistId]
    );

    // Effect to trigger search when debounced search value changes
    useEffect(() => {
        if (debouncedSearch && debouncedSearch.trim().length >= 2) {
            handleSearch(debouncedSearch);
        } else {
            setSearchResults([]);
        }
    }, [debouncedSearch, handleSearch]);

    const handleAttachUser = async (userId: string) => {
        const score = userScores[userId] || "0";
        const scoreValue = parseFloat(score);

        if (isNaN(scoreValue)) {
            toast.error("Score must be a valid number");
            return;
        }

        try {
            setIsAttaching(userId);
            const response = await attachUserToRanklist(ranklistId, userId, scoreValue);
            if (response.success) {
                toast.success("User attached successfully");
                // Remove user from search results
                setSearchResults(prev => prev.filter(user => user.id !== userId));
                // Remove score from state
                setUserScores(prev => {
                    const newScores = { ...prev };
                    delete newScores[userId];
                    return newScores;
                });
                // Refresh search if this was the only result
                if (searchResults.length === 1 && searchQuery.trim().length >= 2) {
                    handleSearch(searchQuery);
                }
                onSuccess?.();
            } else {
                toast.error(response.error || "Failed to attach user");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsAttaching(null);
        }
    };

    const updateUserScore = (userId: string, score: string) => {
        setUserScores(prev => ({
            ...prev,
            [userId]: score
        }));
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setUserScores({});
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchQuery.trim().length >= 2) {
            e.preventDefault();
            handleSearch(searchQuery);
        }
    };

    // Reset search when dialog is opened
    useEffect(() => {
        if (isOpen) {
            setSearchQuery("");
            setSearchResults([]);
            setUserScores({});
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Attach User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Attach User to Ranklist</DialogTitle>
                    <DialogDescription>
                        Search for users to attach to this ranklist. You can search by name, email, username, or student ID.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search users (min. 2 characters)..."
                            className="pl-10 pr-10"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value === "") {
                                    setSearchResults([]);
                                }
                            }}
                            onKeyDown={handleKeyDown}
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1 h-8 w-8 p-0"
                                onClick={clearSearch}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Clear search</span>
                            </Button>
                        )}
                    </div>

                    <div className="border rounded-lg bg-muted/30">
                        {isSearching ? (
                            <div className="divide-y">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="p-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center space-x-3 flex-1">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-40" />
                                                <Skeleton className="h-3 w-32" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Skeleton className="h-8 w-20" />
                                            <Skeleton className="h-8 w-16" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="max-h-[400px] overflow-auto divide-y">
                                {searchResults.map((user) => (
                                    <div
                                        key={user.id}
                                        className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage
                                                    src={user.image || undefined}
                                                    alt={user.name}
                                                />
                                                <AvatarFallback className="bg-primary/10">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{user.name}</div>
                                                <div className="text-sm text-muted-foreground truncate">
                                                    {user.email}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {user.studentId && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {user.studentId}
                                                        </Badge>
                                                    )}
                                                    {user.department && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {user.department}
                                                        </Badge>
                                                    )}
                                                    {user.username && (
                                                        <Badge variant="outline" className="text-xs">
                                                            @{user.username}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-3 space-y-2">
                                            <Input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                placeholder="0"
                                                value={userScores[user.id] || "0"}
                                                onChange={(e) => updateUserScore(user.id, e.target.value)}
                                                className="w-20 h-8 text-xs"
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => handleAttachUser(user.id)}
                                                disabled={isAttaching === user.id}
                                                className="w-20"
                                            >
                                                {isAttaching === user.id ? (
                                                    <>
                                                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                                        Adding...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="h-3.5 w-3.5 mr-1" />
                                                        Attach
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : searchQuery && searchQuery.length >= 2 && !isSearching ? (
                            <div className="p-12 text-center">
                                <div className="rounded-full bg-muted p-3 mx-auto w-fit">
                                    <Search className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground mt-3">
                                    No users found matching &quot;{searchQuery}&quot;
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Try adjusting your search terms
                                </p>
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="rounded-full bg-muted p-3 mx-auto w-fit">
                                    <UserPlus className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground mt-3">
                                    Start typing to search for users
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Search by name, email, username, or student ID
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 