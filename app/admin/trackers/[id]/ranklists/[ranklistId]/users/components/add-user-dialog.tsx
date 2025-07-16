"use client";

import { useCallback } from "react";
import {
  UserSearchDialog,
  AddUserResponse,
} from "@/components/user-search-dialog";
import { getAvailableUsers, attachUserToRanklist } from "../../../actions";

interface AttachUserDialogProps {
  ranklistId: number;
  onUserAdded?: () => void;
}

export function AttachUserDialog({
  ranklistId,
  onUserAdded,
}: AttachUserDialogProps) {
  const handleSearchUsers = useCallback(
    async (query: string): Promise<AddUserResponse> => {
      return await getAvailableUsers(ranklistId, query);
    },
    [ranklistId]
  );

  const handleAddUser = useCallback(
    async (userId: string): Promise<AddUserResponse> => {
      // Use default score of 0
      return await attachUserToRanklist(ranklistId, userId, 0);
    },
    [ranklistId]
  );

  const handleUserAdded = useCallback(() => {
    // Call the original callback without data since attachUserToRanklist doesn't return user data
    if (onUserAdded) {
      onUserAdded();
    }
  }, [onUserAdded]);

  return (
    <UserSearchDialog
      triggerLabel="Add User"
      dialogTitle="Add User to Ranklist"
      dialogDescription="Search for users to add to this ranklist"
      buttonLabel="Attach"
      loadingLabel="Adding..."
      successMessage="User added successfully"
      searchUsers={handleSearchUsers}
      addUser={handleAddUser}
      onUserAdded={handleUserAdded}
    />
  );
}
