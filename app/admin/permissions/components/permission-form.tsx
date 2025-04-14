"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Permission } from "@prisma/client";

import {
  permissionFormSchema,
  type PermissionFormValues,
} from "../schemas/permission";
import { createPermission, updatePermission } from "../actions";

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

interface PermissionFormProps {
  initialData?: Permission | null;
  isEditing?: boolean;
  permissionId?: string;
}

export function PermissionForm({
  initialData,
  isEditing = false,
  permissionId,
}: PermissionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  const onSubmit = async (values: PermissionFormValues) => {
    setIsLoading(true);
    try {
      let response;

      if (isEditing && permissionId) {
        response = await updatePermission(permissionId, values);
      } else {
        response = await createPermission(values);
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
        <CardTitle>
          {isEditing ? "Edit Permission" : "Create New Permission"}
        </CardTitle>
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
                      <Input placeholder="Enter permission name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Permission name should be a unique identifier. Example:
                      &quot;users:create&quot;, &quot;posts:delete&quot;
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
                        placeholder="Enter permission description (optional)"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of what this permission allows.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/permissions")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : isEditing
                  ? "Update Permission"
                  : "Create Permission"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
