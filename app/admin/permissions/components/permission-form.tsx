"use client";

import { useState } from "react";
import { useRouter } from 'nextjs-toploader/app';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { type permissions } from "@/db/schema";

import {
    permissionFormSchema,
    permissionUpdateFormSchema,
    type PermissionFormValues,
    type PermissionUpdateFormValues,
} from "../schemas/permission";
import { createPermission, updatePermission } from "../actions";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PermissionFormProps {
    initialData?: Partial<typeof permissions.$inferSelect> | null;
    isEditing?: boolean;
}

export function PermissionForm({ initialData, isEditing = false }: PermissionFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Use the appropriate schema based on whether we're editing or creating
    const formSchema = isEditing ? permissionUpdateFormSchema : permissionFormSchema;

    const form = useForm<PermissionFormValues | PermissionUpdateFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            ...(isEditing && initialData?.id ? { id: initialData.id } : {}),
        },
    });

    const onSubmit = async (values: PermissionFormValues | PermissionUpdateFormValues) => {
        setIsLoading(true);
        try {
            let response;

            if (isEditing && initialData?.id) {
                response = await updatePermission({
                    ...values,
                    id: initialData.id,
                } as PermissionUpdateFormValues);
            } else {
                response = await createPermission(values as PermissionFormValues);
            }

            if (response.success) {
                toast.success(
                    isEditing
                        ? "Permission updated successfully!"
                        : "Permission created successfully!"
                );
                router.push("/admin/permissions");
            } else {
                if (typeof response.error === "string") {
                    toast.error(response.error);
                } else {
                    // Show specific field errors in form
                    if (response.error && typeof response.error === "object" && "name" in response.error) {
                        form.setError("name", {
                            type: "manual",
                            message: (response.error as Record<string, string[]>).name[0],
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEditing ? "Edit Permission" : "Create New Permission"}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Permission Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter permission name (e.g., USERS:MANAGE, ROLES:VIEW)"
                                            {...field}
                                        />
                                    </FormControl>
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
                                            placeholder="Enter permission description"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/admin/permissions")}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : isEditing ? "Update Permission" : "Create Permission"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
} 