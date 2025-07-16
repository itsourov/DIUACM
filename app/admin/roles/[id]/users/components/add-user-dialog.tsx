"use client";

import { useCallback } from "react";
import { UserSearchDialog, AddUserResponse } from "@/components/user-search-dialog";
import { searchUsersForRole, assignUserToRole } from "../actions";

type RoleUserWithUser = {
    roleId: number;
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

interface AddUserDialogProps {
    roleId: number;
    onUserAdded?: (user: RoleUserWithUser) => void;
}

export function AddUserDialog({ roleId, onUserAdded }: AddUserDialogProps) {
    const handleSearchUsers = useCallback(
        async (query: string): Promise<AddUserResponse> => {
            return await searchUsersForRole(roleId, query);
        },
        [roleId]
    );

    const handleAddUser = useCallback(
        async (userId: string): Promise<AddUserResponse> => {
            return await assignUserToRole(roleId, userId);
        },
        [roleId]
    );

    return (
        <UserSearchDialog
            triggerLabel="Assign User"
            dialogTitle="Assign User to Role"
            dialogDescription="Search for users to assign to this role"
            buttonLabel="Assign"
            loadingLabel="Assigning..."
            successMessage="User assigned to role successfully"
            searchUsers={handleSearchUsers}
            addUser={handleAddUser}
            onUserAdded={onUserAdded}
        />
    );
} 