"use client";

import { useState, useEffect } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Role, Permission } from "@prisma/client";

import { roleFormSchema, type RoleFormValues } from "../schemas/role";
import { createRole, updateRole, getAllPermissions } from "../actions";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

interface RoleFormProps {
  initialData?: RoleWithPermissions | null;
  isEditing?: boolean;
  roleId?: string;
}

export function RoleForm({
  initialData,
  isEditing = false,
  roleId,
}: RoleFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  // Setup form with validation
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      permissionIds: initialData?.permissions.map((p) => p.id) || [],
    },
  });

  // Fetch all permissions for the form
  useEffect(() => {
    const fetchPermissions = async () => {
      setIsLoadingPermissions(true);
      try {
        const result = await getAllPermissions();
        if (result.success && result.data) {
          setPermissions(result.data);
        } else {
          toast.error("Failed to load permissions");
        }
      } catch (error) {
        console.error("Error loading permissions:", error);
        toast.error("Failed to load permissions");
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, []);

  const onSubmit = async (values: RoleFormValues) => {
    setIsLoading(true);
    try {
      let response;

      if (isEditing && roleId) {
        response = await updateRole(roleId, values);
      } else {
        response = await createRole(values);
      }

      if (response.success) {
        toast.success(
          isEditing
            ? "Role updated successfully!"
            : "Role created successfully!"
        );
        router.push("/admin/roles");
      } else {
        if (typeof response.error === "string") {
          toast.error(response.error);
        } else {
          toast.error("Please check the form for errors.");
        }
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Role" : "Create New Role"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter role name" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique name for the role
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter role description (optional)"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of this role and its purpose
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissionIds"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Permissions</FormLabel>
                      <FormDescription>
                        Select the permissions for this role
                      </FormDescription>
                    </div>
                    {isLoadingPermissions ? (
                      <div className="text-center py-4">
                        Loading permissions...
                      </div>
                    ) : permissions.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No permissions found. Please create permissions first.
                      </div>
                    ) : (
                      <ScrollArea className="h-72 border rounded-md p-4">
                        <div className="space-y-4">
                          {permissions.map((permission) => (
                            <FormField
                              key={permission.id}
                              control={form.control}
                              name="permissionIds"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={permission.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 py-1"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          permission.id
                                        )}
                                        onCheckedChange={(checked) => {
                                          const currentPermissions =
                                            field.value || [];
                                          return checked
                                            ? field.onChange([
                                                ...currentPermissions,
                                                permission.id,
                                              ])
                                            : field.onChange(
                                                currentPermissions.filter(
                                                  (value) =>
                                                    value !== permission.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-sm font-medium">
                                        {permission.name}
                                      </FormLabel>
                                      {permission.description && (
                                        <p className="text-xs text-muted-foreground">
                                          {permission.description}
                                        </p>
                                      )}
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/roles")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isLoadingPermissions}
              >
                {isLoading
                  ? "Saving..."
                  : isEditing
                  ? "Update Role"
                  : "Create Role"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
