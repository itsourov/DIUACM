"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Search, UserPlus, Loader2 } from "lucide-react";
import { searchUsersForEvent, addEventAttendee } from "../actions";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";

type UserSearchResult = {
    id: string;
    name: string;
    email: string;
    username?: string | null;
    image?: string | null;
    studentId?: string | null;
    department?: string | null;
};

// Define type for event attendee with user data
type EventAttendeeWithUser = {
    eventId: number;
    userId: string;
    createdAt?: Date | null;
    user: UserSearchResult;
};

interface AddAttendeeDialogProps {
    eventId: number;
    onAttendeeAdded?: (attendee: EventAttendeeWithUser) => void;
}

export function AddAttendeeDialog({
    eventId,
    onAttendeeAdded,
}: AddAttendeeDialogProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [addingUserId, setAddingUserId] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const performSearch = useCallback(async () => {
        if (!debouncedSearch.trim()) {
            setSearchResults([]);
            setHasSearched(false);
            return;
        }

        setIsLoading(true);
        try {
            const result = await searchUsersForEvent(eventId, debouncedSearch);
            if (result.success) {
                setSearchResults(result.data || []);
                setHasSearched(true);
            } else {
                toast.error(result.error || "Failed to search users");
                setSearchResults([]);
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }, [eventId, debouncedSearch]);

    useEffect(() => {
        performSearch();
    }, [performSearch]);

    const handleAddAttendee = async (user: UserSearchResult) => {
        setAddingUserId(user.id);
        try {
            const result = await addEventAttendee(eventId, user.id);

            if (result.success) {
                toast.success(`${user.name} has been added as an attendee`);
                onAttendeeAdded?.(result.data as EventAttendeeWithUser);

                // Remove the user from search results
                setSearchResults(prev => prev.filter(u => u.id !== user.id));

                // If no more results, clear search
                if (searchResults.length === 1) {
                    setSearchQuery("");
                    setHasSearched(false);
                }
            } else {
                toast.error(result.error || "Failed to add attendee");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setAddingUserId(null);
        }
    };

    const resetDialog = () => {
        setSearchQuery("");
        setSearchResults([]);
        setHasSearched(false);
        setIsLoading(false);
        setAddingUserId(null);
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            resetDialog();
        }
    };

    // Function to create avatar initials from a name
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Attendee
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Event Attendee</DialogTitle>
                    <DialogDescription>
                        Search for users to add as attendees to this event.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or student ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="min-h-[200px] max-h-[300px] overflow-y-auto">
                        {isLoading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-3 p-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-[200px]" />
                                            <Skeleton className="h-3 w-[160px]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="space-y-2">
                                {searchResults.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={user.image || ""} alt={user.name} />
                                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium leading-none">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {user.email}
                                                </p>
                                                <div className="flex gap-2 mt-1">
                                                    {user.studentId && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {user.studentId}
                                                        </Badge>
                                                    )}
                                                    {user.department && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {user.department}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleAddAttendee(user)}
                                            disabled={addingUserId === user.id}
                                            className="shrink-0"
                                        >
                                            {addingUserId === user.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <UserPlus className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : hasSearched ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Search className="mx-auto h-8 w-8 mb-2" />
                                <p className="text-sm">No users found matching your search.</p>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <UserPlus className="mx-auto h-8 w-8 mb-2" />
                                <p className="text-sm">Search for users to add as attendees.</p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 