"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, List, Weight, Hash } from "lucide-react";
import { removeEventRanklist, updateEventRanklistWeight } from "../actions";
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
import { AddRanklistDialog } from "./add-ranklist-dialog";
import { WeightEditModal } from "./weight-edit-modal";
import { type EventRankListWithRankList } from "../../../types";

interface RanklistsListProps {
  eventId: number;
  initialRanklists: EventRankListWithRankList[];
}

export function RanklistsList({
  eventId,
  initialRanklists,
}: RanklistsListProps) {
  const [ranklists, setRanklists] =
    useState<EventRankListWithRankList[]>(initialRanklists);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [weightEditModal, setWeightEditModal] = useState<{
    isOpen: boolean;
    rankListId: number | null;
    currentWeight: number;
    ranklistTitle: string;
  }>({
    isOpen: false,
    rankListId: null,
    currentWeight: 0,
    ranklistTitle: "",
  });

  const handleRanklistAdded = (newRanklist: EventRankListWithRankList) => {
    setRanklists((prev) => [newRanklist, ...prev]);
  };

  const handleRemoveRanklist = async (rankListId: number) => {
    try {
      setIsDeleting(rankListId);
      const response = await removeEventRanklist(eventId, rankListId);
      if (response.success) {
        setRanklists(
          ranklists.filter((item) => item.rankListId !== rankListId)
        );
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

  const handleWeightEdit = (
    rankListId: number,
    currentWeight: number,
    ranklistTitle: string
  ) => {
    setWeightEditModal({
      isOpen: true,
      rankListId,
      currentWeight,
      ranklistTitle,
    });
  };

  const handleWeightSave = async (newWeight: number) => {
    if (!weightEditModal.rankListId) return;

    try {
      const response = await updateEventRanklistWeight(
        eventId,
        weightEditModal.rankListId,
        newWeight
      );
      if (response.success) {
        setRanklists((prev) =>
          prev.map((item) =>
            item.rankListId === weightEditModal.rankListId
              ? { ...item, weight: newWeight }
              : item
          )
        );
        toast.success("Weight updated successfully");
      } else {
        toast.error(response.error || "Failed to update weight");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    }
  };

  const getCompositeTitle = (item: EventRankListWithRankList) => {
    if (item.tracker?.title) {
      return `${item.tracker.title} - (${item.rankList.keyword})`;
    }
    return item.rankList.keyword;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-xl">
          <List className="h-5 w-5 mr-2" />
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
              <List className="h-6 w-6" />
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
                  <TableHead>Description</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranklists.map((item) => (
                  <TableRow key={`${item.eventId}-${item.rankListId}`}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {getCompositeTitle(item)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {item.rankList.description || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() =>
                          handleWeightEdit(
                            item.rankListId,
                            item.weight,
                            getCompositeTitle(item)
                          )
                        }
                        className="flex items-center space-x-1 text-sm hover:bg-muted p-1 rounded"
                      >
                        <Weight className="h-3 w-3 text-muted-foreground" />
                        <span>{item.weight}</span>
                      </button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={isDeleting === item.rankListId}
                        onClick={() => handleRemoveRanklist(item.rankListId)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <WeightEditModal
        isOpen={weightEditModal.isOpen}
        onClose={() =>
          setWeightEditModal((prev) => ({ ...prev, isOpen: false }))
        }
        currentWeight={weightEditModal.currentWeight}
        ranklistTitle={weightEditModal.ranklistTitle}
        onSave={handleWeightSave}
      />
    </Card>
  );
}
