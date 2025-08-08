"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { type IntraContest } from "@/db/schema";
import { VisibilityStatus } from "@/db/schema";
import {
  intraContestFormSchema,
  type IntraContestFormValues,
} from "../schemas/intra-contest";
import { createIntraContest, updateIntraContest } from "../actions";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BannerUpload } from "./banner-upload";

interface IntraContestFormProps {
  initialData?: IntraContest | null;
  isEditing?: boolean;
}

function toInputDateTimeLocal(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}

export function IntraContestForm({
  initialData,
  isEditing = false,
}: IntraContestFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<IntraContestFormValues>({
    resolver: zodResolver(intraContestFormSchema),
  defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
          description: initialData.description ?? "",
      bannerImage: (initialData as IntraContest & { bannerImage?: string }).bannerImage || "",
          registrationFee: initialData.registrationFee,
          registrationStartTime: initialData.registrationStartTime
            ? toInputDateTimeLocal(new Date(initialData.registrationStartTime))
            : toInputDateTimeLocal(new Date()),
          registrationEndTime: initialData.registrationEndTime
            ? toInputDateTimeLocal(new Date(initialData.registrationEndTime))
            : toInputDateTimeLocal(new Date()),
          mainEventDateTime: initialData.mainEventDateTime
            ? toInputDateTimeLocal(new Date(initialData.mainEventDateTime))
            : toInputDateTimeLocal(new Date()),
          status: initialData.status as VisibilityStatus,
          registrationLimit: initialData.registrationLimit ?? null,
        }
      : {
          name: "",
          slug: "",
          description: "",
          bannerImage: "",
          registrationFee: 0,
          registrationStartTime: toInputDateTimeLocal(new Date()),
          registrationEndTime: toInputDateTimeLocal(new Date()),
          mainEventDateTime: toInputDateTimeLocal(new Date()),
          status: VisibilityStatus.DRAFT,
          registrationLimit: null,
        },
  });

  const onSubmit = async (values: IntraContestFormValues) => {
    setIsLoading(true);
    try {
      const result =
        isEditing && initialData?.id
          ? await updateIntraContest(initialData.id, values)
          : await createIntraContest(values);

      if (result.success) {
        toast.success(
          isEditing
            ? "Intra contest updated successfully"
            : "Intra contest created successfully"
        );
        router.push("/admin/intra-contests");
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Intra Contest" : "Create New Intra Contest"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter name"
                        {...field}
                        disabled={isLoading}
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
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="enter-slug"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registrationFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Fee</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value || "0", 10))
                        }
                        disabled={isLoading}
                      />
                    </FormControl>
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
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={VisibilityStatus.PUBLISHED}>
                          Published
                        </SelectItem>
                        <SelectItem value={VisibilityStatus.DRAFT}>
                          Draft
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

      <FormField
              control={form.control}
              name="bannerImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Image</FormLabel>
                  <FormControl>
        <BannerUpload value={field.value || ""} onChange={field.onChange} />
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
                      placeholder="Enter description (optional)"
                      className="min-h-[100px]"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="registrationStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Starts</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registrationEndTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Ends</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mainEventDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Event</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="registrationLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Limit</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? null
                            : parseInt(e.target.value, 10)
                        )
                      }
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/intra-contests")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
