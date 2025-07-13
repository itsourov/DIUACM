"use client";
import { useState } from "react";
import { useRouter } from 'nextjs-toploader/app';
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createTeam, updateTeam } from "../actions";
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
import { Card, CardContent } from "@/components/ui/card";

const teamFormSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  rank: z.string().optional(),
  solveCount: z.string().optional(),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

interface Team {
  id: number;
  name: string;
  contestId: number;
  rank?: number | null;
  solveCount?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

interface TeamFormProps {
  contestId: number;
  initialData?: Team | null;
  isEditing?: boolean;
}

export function TeamForm({
  contestId,
  initialData,
  isEditing = false,
}: TeamFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<TeamFormValues> = {
    name: initialData?.name || "",
    rank: initialData?.rank?.toString() || "",
    solveCount: initialData?.solveCount?.toString() || "",
  };

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: TeamFormValues) => {
    try {
      setIsSubmitting(true);

      // Convert string values to numbers for API
      const formattedData = {
        name: data.name,
        rank: data.rank && data.rank !== "" ? parseInt(data.rank) : undefined,
        solveCount: data.solveCount && data.solveCount !== "" ? parseInt(data.solveCount) : undefined,
      };

      if (isEditing && initialData) {
        const response = await updateTeam(
          initialData.id,
          contestId,
          formattedData
        );
        if (response.success) {
          toast.success("Team updated successfully");
          router.push(`/admin/contests/${contestId}/teams`);
        } else {
          toast.error(response.error || "Failed to update team");
        }
      } else {
        const response = await createTeam(contestId, formattedData);
        if (response.success) {
          toast.success("Team created successfully");
          router.push(`/admin/contests/${contestId}/teams`);
        } else {
          toast.error(response.error || "Failed to create team");
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter team name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rank</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Team rank (optional)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? null : parseInt(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="solveCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Solve Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Number of problems solved (optional)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? null : parseInt(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                    ? "Update Team"
                    : "Create Team"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
