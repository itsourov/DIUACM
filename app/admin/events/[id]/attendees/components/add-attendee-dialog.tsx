"use client";

import { useCallback } from "react";
import {
  UserSearchDialog,
  AddUserResponse,
} from "@/components/user-search-dialog";
import { searchUsersForEvent, addEventAttendee } from "../actions";
import { type AttendanceWithUser } from "../../../types";

interface AddAttendeeDialogProps {
  eventId: number;
  onAttendeeAdded?: (attendee: AttendanceWithUser) => void;
}

export function AddAttendeeDialog({
  eventId,
  onAttendeeAdded,
}: AddAttendeeDialogProps) {
  const handleSearchUsers = useCallback(
    async (query: string): Promise<AddUserResponse> => {
      return await searchUsersForEvent(eventId, query);
    },
    [eventId]
  );

  const handleAddUser = useCallback(
    async (userId: string): Promise<AddUserResponse> => {
      return await addEventAttendee(eventId, userId);
    },
    [eventId]
  );

  return (
    <UserSearchDialog
      triggerLabel="Add Attendee"
      dialogTitle="Add Event Attendee"
      dialogDescription="Search for users to add to this event"
      buttonLabel="Add"
      loadingLabel="Adding..."
      successMessage="Attendee added successfully"
      searchUsers={handleSearchUsers}
      addUser={handleAddUser}
      onUserAdded={onAttendeeAdded}
    />
  );
}
