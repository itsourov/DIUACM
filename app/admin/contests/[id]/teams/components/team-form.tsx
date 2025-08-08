"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Team } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Save, Trophy } from "lucide-react";
import { createTeam, updateTeam } from "../actions";
import { teamFormSchema, type TeamFormValues } from "../../../schemas/contest";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface TeamFormProps {
  contestId: number;
  team?: Pick<Team, "id" | "name" | "rank" | "solveCount">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TeamForm({
  contestId,
  team,
  onSuccess,
  onCancel,
}: TeamFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!team;

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: team?.name || "",
      rank: team?.rank || undefined,
      solveCount: team?.solveCount || undefined,
    },
  });

  const onSubmit = async (values: TeamFormValues) => {
    try {
      setIsSubmitting(true);

      let response;
      if (isEditing) {
        response = await updateTeam(team.id, contestId, values);
      } else {
        response = await createTeam(contestId, values);
      }

      if (response.success) {
        toast.success(
          response.message ||
            `Team ${isEditing ? "updated" : "created"} successfully`
        );
        form.reset();
        onSuccess?.();
      } else {
        toast.error(response.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="rounded-full bg-primary/10 p-2">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>
              {isEditing ? `Edit Team: ${team.name}` : "Create New Team"}
            </CardTitle>
            <CardDescription>
              {isEditing
                ? "Update team information and statistics"
                : "Add a new team to this contest"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter team name"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    A unique name for this team within the contest
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="rank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rank (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 1"
                        min="1"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : parseInt(value, 10)
                          );
                        }}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Team&apos;s final rank in the contest
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="solveCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Problems Solved (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 5"
                        min="0"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : parseInt(value, 10)
                          );
                        }}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of problems solved by this team
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? "Update Team" : "Create Team"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
