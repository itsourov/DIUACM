"use client";

import { useState } from "react";
import { useRouter } from 'nextjs-toploader/app';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { RankList } from "@prisma/client";

import {
  ranklistFormSchema,
  type RanklistFormValues,
} from "../schemas/ranklist";
import { createRanklist, updateRanklist } from "../actions";

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
import { Card, CardContent } from "@/components/ui/card";

interface RanklistFormProps {
  trackerId: string;
  initialData?: RankList | null;
  isEditing?: boolean;
}

export function RanklistForm({
  trackerId,
  initialData,
  isEditing = false,
}: RanklistFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<RanklistFormValues> = {
    keyword: initialData?.keyword || "",
    description: initialData?.description || "",
    weightOfUpsolve: initialData?.weightOfUpsolve || 0.5,
  };

  const form = useForm<RanklistFormValues>({
    resolver: zodResolver(ranklistFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: RanklistFormValues) => {
    try {
      setIsSubmitting(true);

      if (isEditing && initialData) {
        const response = await updateRanklist(initialData.id, trackerId, data);
        if (response.success) {
          toast.success("Ranklist updated successfully");
          router.push(`/admin/trackers/${trackerId}/ranklists`);
        } else {
          toast.error(response.error || "Failed to update ranklist");
        }
      } else {
        const response = await createRanklist(trackerId, data);
        if (response.success) {
          toast.success("Ranklist created successfully");
          router.push(`/admin/trackers/${trackerId}/ranklists`);
        } else {
          toast.error(response.error || "Failed to create ranklist");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="keyword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keyword</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter ranklist keyword" {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique identifier for this ranklist (e.g., &ldquo;Week
                    1&rdquo;, &ldquo;Phase 1&rdquo;, etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weightOfUpsolve"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upsolve Weight</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      placeholder="Enter upsolve weight"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Weight for upsolve points (between 0 and 1)
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
                      placeholder="Enter a description for this ranklist..."
                      rows={4}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Update Ranklist"
                  : "Create Ranklist"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
