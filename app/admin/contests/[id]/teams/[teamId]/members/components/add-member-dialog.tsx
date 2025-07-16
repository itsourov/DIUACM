"use client";

import { useCallback } from "react";
import { UserSearchDialog, AddUserResponse } from "@/components/user-search-dialog";
import { searchUsersForTeam, addTeamMember } from "../actions";

type TeamMemberWithUser = {
  teamId: number;
  userId: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  user: {
    id: string;
    name: string;
    email: string;
    username?: string | null;
    image?: string | null;
    studentId?: string | null;
    department?: string | null;
  };
};

interface AddMemberDialogProps {
  teamId: number;
  onMemberAdded?: (member: TeamMemberWithUser) => void;
}

export function AddMemberDialog({
  teamId,
  onMemberAdded,
}: AddMemberDialogProps) {
  const handleSearchUsers = useCallback(
    async (query: string): Promise<AddUserResponse> => {
      return await searchUsersForTeam(teamId, query);
    },
    [teamId]
  );

  const handleAddUser = useCallback(
    async (userId: string): Promise<AddUserResponse> => {
      return await addTeamMember(teamId, userId);
    },
    [teamId]
  );

  return (
    <UserSearchDialog
      triggerLabel="Add Member"
      dialogTitle="Add Team Member"
      dialogDescription="Search for users to add to this team"
      buttonLabel="Add"
      loadingLabel="Adding..."
      successMessage="Team member added successfully"
      searchUsers={handleSearchUsers}
      addUser={handleAddUser}
      onUserAdded={onMemberAdded}
    />
  );
}
