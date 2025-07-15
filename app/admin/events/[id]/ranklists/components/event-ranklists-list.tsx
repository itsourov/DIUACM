"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, List, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { detachRanklistFromEvent, searchRanklistsForEvent, attachRanklistToEvent } from "../actions";

type RanklistData = {
    id: number;
    keyword: string;
    description?: string | null;
    weightOfUpsolve: number;
    order: number;
    isActive: boolean;
    considerStrictAttendance: boolean;
    trackerId: number;
};

type TrackerData = {
    id: number;
    title: string;
    slug: string;
};

type EventRanklistWithData = {
    eventId: number;
    rankListId: number;
    weight: number;
    ranklist: RanklistData;
    tracker: TrackerData;
};

interface EventRanklistsListProps {
    eventId: number;
    eventTitle: string;
    initialRanklists: EventRanklistWithData[];
}

export function EventRanklistsList({ eventId, eventTitle, initialRanklists }: EventRanklistsListProps) {
    const [ranklists, setRanklists] = useState<EventRanklistWithData[]>(initialRanklists);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<(RanklistData & { tracker: TrackerData })[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showAttachDialog, setShowAttachDialog] = useState(false);

    const searchRanklists = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const result = await searchRanklistsForEvent(eventId, searchQuery);
            if (result.success) {
                setSearchResults(result.data || []);
            } else {
                toast.error(result.error || "Failed to search ranklists");
            }
        } catch {
            toast.error("Something went wrong while searching");
        } finally {
            setIsSearching(false);
        }
    };

    const handleAttachRanklist = async (ranklistId: number, weight: number = 1.0) => {
        try {
            const result = await attachRanklistToEvent(eventId, ranklistId, weight);
            if (result.success) {
                toast.success("Ranklist attached successfully");
                setRanklists(prev => [...prev, result.data as EventRanklistWithData]);
                setSearchResults(prev => prev.filter(r => r.id !== ranklistId));
                setShowAttachDialog(false);
                setSearchQuery("");
            } else {
                toast.error(result.error || "Failed to attach ranklist");
            }
        } catch {
            toast.error("Something went wrong");
        }
    };

    const handleDetachRanklist = async (ranklistId: number) => {
        try {
            const result = await detachRanklistFromEvent(eventId, ranklistId);
            if (result.success) {
                toast.success("Ranklist detached successfully");
                setRanklists(prev => prev.filter(r => r.rankListId !== ranklistId));
            } else {
                toast.error(result.error || "Failed to detach ranklist");
            }
        } catch {
            toast.error("Something went wrong");
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <List className="h-5 w-5" />
                        Event Ranklists
                        <Badge variant="secondary" className="ml-2">
                            {ranklists.length}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Manage ranklists for {eventTitle}
                    </CardDescription>
                </div>
                <Dialog open={showAttachDialog} onOpenChange={setShowAttachDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Attach Ranklist
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Attach Ranklist</DialogTitle>
                            <DialogDescription>
                                Search for ranklists to attach to this event.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Search ranklists..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button onClick={searchRanklists} disabled={isSearching}>
                                    Search
                                </Button>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {searchResults.map((ranklist) => (
                                    <div key={ranklist.id} className="flex items-center justify-between p-2 border rounded">
                                        <div>
                                            <div className="font-medium">{ranklist.keyword}</div>
                                            <div className="text-sm text-muted-foreground">{ranklist.tracker.title}</div>
                                        </div>
                                        <Button size="sm" onClick={() => handleAttachRanklist(ranklist.id)}>
                                            Attach
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {ranklists.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <div className="rounded-full bg-muted p-3">
                            <List className="h-6 w-6" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No ranklists attached</h3>
                        <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                            Start by attaching ranklists to this event.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[240px]">Ranklist Details</TableHead>
                                    <TableHead>Tracker</TableHead>
                                    <TableHead>Weight</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ranklists.map((eventRanklist) => (
                                    <TableRow key={eventRanklist.rankListId}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{eventRanklist.ranklist.keyword}</div>
                                                {eventRanklist.ranklist.description && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {eventRanklist.ranklist.description}
                                                    </div>
                                                )}
                                                <div className="flex gap-1 mt-1">
                                                    {eventRanklist.ranklist.considerStrictAttendance && (
                                                        <Badge variant="outline" className="text-xs">Strict Attendance</Badge>
                                                    )}
                                                    <Badge variant="secondary" className="text-xs">
                                                        Upsolve: {eventRanklist.ranklist.weightOfUpsolve}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{eventRanklist.tracker.title}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Scale className="h-4 w-4 text-muted-foreground" />
                                                {eventRanklist.weight}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Detach Ranklist</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to detach this ranklist from the event?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDetachRanklist(eventRanklist.rankListId)}
                                                        >
                                                            Detach
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 