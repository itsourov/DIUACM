"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Event, EventRankList } from "@prisma/client";
import { updateEventWeight } from "@/app/admin/trackers/[id]/ranklists/[ranklistId]/events/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type EventWithData = EventRankList & {
  event: Event;
};

interface EditWeightDialogProps {
  ranklistId: string;
  event: EventWithData;
  onClose: () => void;
  onWeightUpdated: (event: EventWithData) => void;
}

export function EditWeightDialog({
  ranklistId,
  event,
  onClose,
  onWeightUpdated,
}: EditWeightDialogProps) {
  const [weight, setWeight] = useState(event.weight);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateWeight = async () => {
    try {
      setIsUpdating(true);
      const response = await updateEventWeight(event.id, ranklistId, weight);

      if (response.success && response.data) {
        toast.success("Weight updated successfully");
        onWeightUpdated(response.data);
      } else {
        toast.error(response.error || "Failed to update weight");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Event Weight</DialogTitle>
          <DialogDescription>
            Adjust the weight of this event in the ranklist scoring
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="border rounded-md p-4">
            <div className="font-medium">{event.event.title}</div>
            <div className="flex items-center mt-2 space-x-2">
              <Badge variant={getStatusVariant(event.event.status)}>
                {getStatusLabel(event.event.status)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(new Date(event.event.startingAt), "MMM d, yyyy")}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label htmlFor="edit-weight">Weight: {weight.toFixed(2)}</Label>
              <Slider
                id="edit-weight"
                min={0}
                max={1}
                step={0.01}
                value={[weight]}
                onValueChange={(vals) => setWeight(vals[0])}
              />
              <p className="text-xs text-muted-foreground">
                Set the weight of this event in the ranklist (0.0 to 1.0)
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateWeight}
            disabled={isUpdating || weight === event.weight}
          >
            {isUpdating ? "Updating..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions for formatting event data
function getStatusLabel(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "Published";
    case "DRAFT":
      return "Draft";
    case "PRIVATE":
      return "Private";
    default:
      return status;
  }
}

function getStatusVariant(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case "PUBLISHED":
      return "default";
    case "DRAFT":
      return "secondary";
    case "PRIVATE":
      return "outline";
    default:
      return "secondary";
  }
}
