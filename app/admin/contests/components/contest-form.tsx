"use client";

import { useState } from "react";
import { useRouter } from 'nextjs-toploader/app';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ContestType, type Contest } from "@prisma/client";

import { contestFormSchema, type ContestFormValues } from "../schemas/contest";
import { createContest, updateContest } from "../actions";

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

interface ContestFormProps {
  initialData?: Contest | null;
  isEditing?: boolean;
}

export function ContestForm({
  initialData,
  isEditing = false,
}: ContestFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Format the date to YYYY-MM-DD for the date input
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const form = useForm<ContestFormValues>({
    resolver: zodResolver(contestFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          standingsUrl: initialData.standingsUrl || "",
          location: initialData.location || "",
          description: initialData.description || "",
          // Format the date for the input
          date: initialData.date,
        }
      : {
          name: "",
          contestType: ContestType.OTHER,
          location: "",
          date: new Date(),
          description: "",
          standingsUrl: "",
        },
  });

  const onSubmit = async (values: ContestFormValues) => {
    setIsLoading(true);
    try {
      let response;

      if (isEditing && initialData?.id) {
        response = await updateContest(initialData.id, values);
      } else {
        response = await createContest(values);
      }

      if (response.success) {
        toast.success(
          isEditing
            ? "Contest updated successfully!"
            : "Contest created successfully!"
        );
        router.push("/admin/contests");
      } else {
        if (typeof response.error === "string") {
          toast.error(response.error);
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
          {isEditing ? "Edit Contest" : "Create New Contest"}
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
                    <FormLabel>Contest Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contest name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contest Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contest type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ContestType.ICPC_REGIONAL}>
                          ICPC Regional
                        </SelectItem>
                        <SelectItem value={ContestType.ICPC_ASIA_WEST}>
                          ICPC Asia West
                        </SelectItem>
                        <SelectItem value={ContestType.IUPC}>IUPC</SelectItem>
                        <SelectItem value={ContestType.OTHER}>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter contest location"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Where was the contest held?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={formatDateForInput(field.value)}
                        onChange={(e) => {
                          // Convert the string date to a Date object
                          field.onChange(
                            e.target.value
                              ? new Date(e.target.value)
                              : new Date()
                          );
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      When did the contest take place?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="standingsUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Standings URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/contest-standings"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    URL to the official contest standings/results page
                    (optional)
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
                      placeholder="Enter a description for this contest..."
                      rows={4}
                      {...field}
                      value={field.value || ""}
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
                onClick={() => router.push("/admin/contests")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : isEditing
                  ? "Update Contest"
                  : "Create Contest"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
