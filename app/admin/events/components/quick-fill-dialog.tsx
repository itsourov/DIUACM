"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventFormValues } from "../schemas/event";
import { fetchContestData } from "../actions";
import { Loader2 } from "lucide-react";

const quickFillSchema = z.object({
  contestLink: z.string().url("Please enter a valid URL"),
});

type QuickFillFormValues = z.infer<typeof quickFillSchema>;

interface QuickFillDialogProps {
  onFill: (data: Partial<EventFormValues>) => void;
}

// Define the response type to properly handle the success/error cases
type ContestResponse =
  | { success: true; data: Partial<EventFormValues>; error?: undefined }
  | { success: false; error: string; data?: undefined };

export function QuickFillDialog({ onFill }: QuickFillDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<QuickFillFormValues>({
    resolver: zodResolver(quickFillSchema),
    defaultValues: {
      contestLink: "",
    },
  });

  const onSubmit = async (values: QuickFillFormValues) => {
    setLoading(true);
    try {
      const response = (await fetchContestData(
        values.contestLink
      )) as ContestResponse;

      if (response.success && response.data) {
        onFill(response.data);
        toast.success("Contest data imported successfully!");
        setOpen(false);
        form.reset();
      } else {
        toast.error(response.error || "Failed to fetch contest data");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Quick Fill Contest</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Fill Contest Data</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="contestLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contest URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://codeforces.com/contest/1234 or AtCoder/VJudge URL"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Loading..." : "Import Data"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
