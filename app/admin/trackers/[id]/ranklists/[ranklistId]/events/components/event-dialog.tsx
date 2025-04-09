"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { RankListEvent } from "@prisma/client";
import { createEvent, updateEvent } from "../actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventDialogProps {
  ranklistId: string;
  event?: RankListEvent;
  onEventSaved: (event: RankListEvent) => void;
  onCancel?: () => void;
}

export function EventDialog({
  ranklistId,
  event,
  onEventSaved,
  onCancel,
}: EventDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!event;

  const defaultValues: Partial<EventFormValues> = {
    title: event?.title || "",
    date: event ? new Date(event.date).toISOString().split("T")[0] : "",
  };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: EventFormValues) => {
    try {
      setIsSubmitting(true);
      const formattedData = {
        title: data.title,
        date: new Date(data.date),
      };

      if (isEditing && event) {
        const response = await updateEvent(event.id, ranklistId, formattedData);
        if (response.success && response.data) {
          onEventSaved(response.data);
          toast.success("Event updated successfully");
          handleClose();
        } else {
          toast.error(response.error || "Failed to update event");
        }
      } else {
        const response = await createEvent(ranklistId, formattedData);
        if (response.success && response.data) {
          onEventSaved(response.data);
          toast.success("Event created successfully");
          handleClose();
        } else {
          toast.error(response.error || "Failed to create event");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    form.reset();
    onCancel?.();
  };

  return (
    <Dialog
      open={open || isEditing}
      onOpenChange={isEditing ? undefined : setOpen}
    >
      {!isEditing && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Event" : "Add Event"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the event details"
              : "Add a new event to this ranklist"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event title" {...field} />
                  </FormControl>
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
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                  ? "Update Event"
                  : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
