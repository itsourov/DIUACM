"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Medal, Edit } from "lucide-react";
import { EventRankList, RankList, Tracker } from "@prisma/client";
import { removeRanklistFromEvent } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { AddRanklistDialog } from "./add-ranklist-dialog";
import { EditWeightDialog } from "./edit-weight-dialog";

type RankListWithData = EventRankList & {
  rankList: RankList & {
    tracker: Tracker;
  };
};

interface RanklistsListProps {
  eventId: number;
  initialRanklists: RankListWithData[];
}

export function RanklistsList({
  eventId,
  initialRanklists,
}: RanklistsListProps) {
  const [ranklists, setRanklists] =
    useState<RankListWithData[]>(initialRanklists);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingRanklist, setEditingRanklist] =
    useState<RankListWithData | null>(null);

  const handleRanklistAdded = (newRanklist: RankListWithData) => {
    setRanklists((prev) => [newRanklist, ...prev]);
  };

  const handleRemoveRanklist = async (eventRanklistId: string) => {
    try {
      setIsDeleting(eventRanklistId);
      const response = await removeRanklistFromEvent(eventRanklistId, eventId);

      if (response.success) {
        setRanklists(ranklists.filter((item) => item.id !== eventRanklistId));
        toast.success("Ranklist removed successfully");
      } else {
        toast.error(response.error || "Failed to remove ranklist");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleWeightUpdated = (updatedRanklist: RankListWithData) => {
    setRanklists(
      ranklists.map((item) =>
        item.id === updatedRanklist.id ? updatedRanklist : item
      )
    );
    setEditingRanklist(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-xl">
          <Medal className="h-5 w-5 mr-2" />
          Ranklists ({ranklists.length})
        </CardTitle>
        <AddRanklistDialog
          eventId={eventId}
          onRanklistAdded={handleRanklistAdded}
        />
      </CardHeader>
      <CardContent>
        {ranklists.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="rounded-full bg-muted p-3">
              <Medal className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No ranklists yet</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-xs">
              Start adding ranklists to this event using the &quot;Add
              Ranklist&quot; button.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ranklist</TableHead>
                  <TableHead>Tracker</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranklists.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.rankList.keyword}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.rankList.description || "No description"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.rankList.tracker.title}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.weight.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setEditingRanklist(item)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit Weight</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          disabled={isDeleting === item.id}
                          onClick={() => handleRemoveRanklist(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Weight edit dialog */}
        {editingRanklist && (
          <EditWeightDialog
            eventId={eventId}
            ranklist={editingRanklist}
            onClose={() => setEditingRanklist(null)}
            onWeightUpdated={handleWeightUpdated}
          />
        )}
      </CardContent>
    </Card>
  );
}
