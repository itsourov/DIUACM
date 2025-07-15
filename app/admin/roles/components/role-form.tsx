"use client";

import { useState } from "react";
import { useRouter } from 'nextjs-toploader/app';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { type roles } from "@/db/schema";

import {
    roleFormSchema,
    roleUpdateFormSchema,
    type RoleFormValues,
    type RoleUpdateFormValues,
} from "../schemas/role";
import { createRole, updateRole } from "../actions";

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

interface RoleFormProps {
    initialData?: Partial<typeof roles.$inferSelect> | null;
    isEditing?: boolean;
}

export function RoleForm({ initialData, isEditing = false }: RoleFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Use the appropriate schema based on whether we're editing or creating
    const formSchema = isEditing ? roleUpdateFormSchema : roleFormSchema;

    const form = useForm<RoleFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
        },
    });

    const onSubmit = async (values: RoleFormValues | RoleUpdateFormValues) => {
        setIsLoading(true);
        try {
            let response;

            if (isEditing && initialData?.id) {
                response = await updateRole({
                    ...values,
                    id: initialData.id,
                } as RoleUpdateFormValues);
            } else {
                response = await createRole(values as RoleFormValues);
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
                <CardTitle>{isEditing ? "Edit Role" : "Create New Role"}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter role name (e.g., Admin, Moderator)"
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
                                            placeholder="Enter role description"
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
                                onClick={() => router.push("/admin/roles")}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : isEditing ? "Update Role" : "Create Role"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
} 