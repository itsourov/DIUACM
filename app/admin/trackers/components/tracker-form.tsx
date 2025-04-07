"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Visibility, type Tracker } from "@prisma/client";

import { trackerFormSchema, type TrackerFormValues } from "../schemas/tracker";
import { createTracker, updateTracker } from "../actions";
import { getEnumValues } from "@/lib/utils";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrackerFormProps {
  initialData?: Tracker | null;
  isEditing?: boolean;
}

export function TrackerForm({
  initialData,
  isEditing = false,
}: TrackerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TrackerFormValues>({
    resolver: zodResolver(trackerFormSchema),
    defaultValues: initialData || {
      title: "",
      slug: "",
      description: "",
      status: Visibility.DRAFT,
    },
  });

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    if (!isEditing || !form.getValues("slug")) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      form.setValue("slug", slug, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: TrackerFormValues) => {
    setIsLoading(true);
    try {
      let response;

      if (isEditing && initialData?.id) {
        response = await updateTracker(initialData.id, values);
      } else {
        response = await createTracker(values);
      }

      if (response.success) {
        toast.success(
          isEditing
            ? "Tracker updated successfully!"
            : "Tracker created successfully!"
        );
        router.push("/admin/trackers");
      } else {
        if (typeof response.error === "string") {
          toast.error(response.error);
        } else if (response.error?.slug) {
          // Show slug error in form
          form.setError("slug", {
            type: "manual",
            message: response.error.slug[0],
          });
          toast.error("Please check the form for errors.");
        } else {
          toast.error(
            "Something went wrong. Please check the form for errors."
          );
        }
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again." + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Tracker" : "Create New Tracker"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracker Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter tracker title"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleTitleChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-col">
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="tracker-slug" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs pt-1">
                        Used in URLs. Lowercase letters, numbers, and hyphens
                        only.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="w-full md:max-w-[50%]">
                  <FormLabel>Visibility</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getEnumValues(Visibility).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0) +
                            status.slice(1).toLowerCase().replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      placeholder="Enter a description for this tracker..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/trackers")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : isEditing
                  ? "Update Tracker"
                  : "Create Tracker"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
