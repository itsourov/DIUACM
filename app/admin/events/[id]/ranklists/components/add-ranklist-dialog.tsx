"use client";

import { useCallback } from "react";
import {
  RanklistSearchDialog,
  AddRanklistResponse,
} from "./ranklist-search-dialog";
import { searchRanklistsForEvent, addEventRanklist } from "../actions";
import { type EventRankListWithRankList } from "../../../types";

interface AddRanklistDialogProps {
  eventId: number;
  onRanklistAdded?: (ranklist: EventRankListWithRankList) => void;
}

export function AddRanklistDialog({
  eventId,
  onRanklistAdded,
}: AddRanklistDialogProps) {
  const handleSearchRanklists = useCallback(
    async (query: string): Promise<AddRanklistResponse> => {
      return await searchRanklistsForEvent(eventId, query);
    },
    [eventId]
  );

  const handleAddRanklist = useCallback(
    async (ranklistId: number): Promise<AddRanklistResponse> => {
      return await addEventRanklist(eventId, ranklistId, 1); // Default weight of 1
    },
    [eventId]
  );

  return (
    <RanklistSearchDialog
      triggerLabel="Add Ranklist"
      dialogTitle="Add Event Ranklist"
      dialogDescription="Search for ranklists to add to this event"
      buttonLabel="Add"
      loadingLabel="Adding..."
      successMessage="Ranklist added successfully"
      searchRanklists={handleSearchRanklists}
      addRanklist={handleAddRanklist}
      onRanklistAdded={onRanklistAdded}
    />
  );
}
