"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { addEventAttendeesToRanklist } from "../../../actions";

interface AddEventAttendeesButtonProps {
  ranklistId: number;
  disabled?: boolean;
}

export function AddEventAttendeesButton({
  ranklistId,
  disabled = false,
}: AddEventAttendeesButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddAttendees = async () => {
    setIsLoading(true);
    try {
      const response = await addEventAttendeesToRanklist(ranklistId);

      if (response.success) {
        const addedCount =
          (response.data as { addedCount?: number })?.addedCount || 0;
        if (addedCount > 0) {
          toast.success(
            response.message || `Added ${addedCount} users to ranklist`
          );
        } else {
          toast.info(response.message || "No new users found to add");
        }
        setIsOpen(false);
      } else {
        toast.error(response.error || "Failed to add event attendees");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error adding event attendees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <Users className="h-4 w-4 mr-2" />
          Add Event Attendees
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add Event Attendees</AlertDialogTitle>
          <AlertDialogDescription>
            This will automatically add all users who have attended any of the
            events attached to this ranklist but are not currently in the
            ranklist. Users will be added with a default score of 0.
            <br />
            <br />
            <strong>Note:</strong> This includes users who have either given
            attendance or participated in contests for the ranklist&apos;s
            events.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAddAttendees}
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding Users...
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                Add Attendees
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
