"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'nextjs-toploader/app';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { updateRolePermissions } from "../../../actions";
import { getAllPermissions } from "../../../../permissions/actions";

interface Permission {
    id: number;
    name: string;
    description: string | null;
}

interface RolePermissionsFormProps {
    roleId: number;
    roleName: string;
    initialPermissions: Permission[];
}

export function RolePermissionsForm({
    roleId,
    roleName,
    initialPermissions,
}: RolePermissionsFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(
        new Set(initialPermissions.map((p) => p.id))
    );

    useEffect(() => {
        const fetchPermissions = async () => {
            const response = await getAllPermissions();
            if (response.success && response.data) {
                setAllPermissions(response.data);
            }
        };
        fetchPermissions();
    }, []);

    const handlePermissionToggle = (permissionId: number) => {
        const newSelected = new Set(selectedPermissions);
        if (newSelected.has(permissionId)) {
            newSelected.delete(permissionId);
        } else {
            newSelected.add(permissionId);
        }
        setSelectedPermissions(newSelected);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await updateRolePermissions(
                roleId,
                Array.from(selectedPermissions)
            );

            if (response.success) {
                toast.success("Role permissions updated successfully!");
                router.refresh();
            } else {
                toast.error(response.error || "Failed to update permissions");
            }
        } catch (error) {
            console.error("Error updating permissions:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const groupPermissionsByPrefix = (permissions: Permission[]) => {
        const groups: Record<string, Permission[]> = {};

        permissions.forEach((permission) => {
            const prefix = permission.name.split(':')[0] || 'Other';
            if (!groups[prefix]) {
                groups[prefix] = [];
            }
            groups[prefix].push(permission);
        });

        return groups;
    };

    const permissionGroups = groupPermissionsByPrefix(allPermissions);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Manage Permissions for {roleName}</CardTitle>
                        <div className="mt-2">
                            <Badge variant="outline">
                                {selectedPermissions.size} of {allPermissions.length} permissions selected
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {Object.entries(permissionGroups).map(([groupName, permissions]) => (
                    <div key={groupName} className="space-y-3">
                        <div>
                            <h3 className="text-lg font-medium">{groupName}</h3>
                            <Separator className="mt-2" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {permissions.map((permission) => (
                                <div
                                    key={permission.id}
                                    className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                    <Checkbox
                                        id={`permission-${permission.id}`}
                                        checked={selectedPermissions.has(permission.id)}
                                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                                    />
                                    <div className="flex-1 space-y-1">
                                        <Label
                                            htmlFor={`permission-${permission.id}`}
                                            className="text-sm font-medium cursor-pointer"
                                        >
                                            {permission.name}
                                        </Label>
                                        {permission.description && (
                                            <p className="text-xs text-muted-foreground">
                                                {permission.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <Separator />

                <div className="flex gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/admin/roles")}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Updating..." : "Update Permissions"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
} 