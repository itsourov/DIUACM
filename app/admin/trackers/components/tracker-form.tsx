"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { VisibilityStatus } from "@/db/schema";

import { trackerFormSchema, type TrackerFormValues } from "../schemas/tracker";
import { createTracker, updateTracker } from "../actions";

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
import { FileBarChart2, Loader2 } from "lucide-react";

interface Tracker {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  status: keyof typeof VisibilityStatus;
  order: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

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
    defaultValues: initialData
      ? {
          title: initialData.title,
          slug: initialData.slug,
          description: initialData.description || "",
          status:
            initialData.status?.toLowerCase() === "published"
              ? "published"
              : initialData.status?.toLowerCase() === "draft"
              ? "draft"
              : VisibilityStatus.DRAFT,
          order: initialData.order,
        }
      : {
          title: "",
          slug: "",
          description: "",
          status: VisibilityStatus.DRAFT,
          order: 0,
        },
  });

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
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
          response.message ||
            (isEditing
              ? "Tracker updated successfully!"
              : "Tracker created successfully!")
        );
        router.push("/admin/trackers");
      } else {
        toast.error(response.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="rounded-full bg-primary/10 p-2">
            <FileBarChart2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>
              {isEditing ? "Edit Tracker" : "Create New Tracker"}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditing
                ? "Update tracker information and settings"
                : "Add a new tracking system for monitoring progress"}
            </p>
          </div>
        </div>
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
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter tracker title"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // Auto-generate slug if not editing or if slug is empty
                          if (!isEditing || !form.getValues("slug")) {
                            form.setValue("slug", generateSlug(e.target.value));
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for your tracker
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="tracker-slug"
                        {...field}
                        onChange={(e) => {
                          field.onChange(generateSlug(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      URL-friendly identifier (auto-generated from title)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Visibility status of the tracker
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Display order (lower numbers appear first)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter tracker description..."
                      rows={4}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description of what this tracker monitors
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Tracker" : "Create Tracker"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/trackers")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
