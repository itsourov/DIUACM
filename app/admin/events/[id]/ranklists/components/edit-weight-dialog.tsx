"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EventRankList, RankList, Tracker } from "@prisma/client";
import { updateRanklistWeight } from "@/app/admin/events/[id]/ranklists/actions";
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

type RankListWithData = EventRankList & {
  rankList: RankList & {
    tracker: Tracker;
  };
};

interface EditWeightDialogProps {
  eventId: number;
  ranklist: RankListWithData;
  onClose: () => void;
  onWeightUpdated: (ranklist: RankListWithData) => void;
}

export function EditWeightDialog({
  eventId,
  ranklist,
  onClose,
  onWeightUpdated,
}: EditWeightDialogProps) {
  const [weight, setWeight] = useState(ranklist.weight);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateWeight = async () => {
    try {
      setIsUpdating(true);
      const response = await updateRanklistWeight(ranklist.id, eventId, weight);

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
          <DialogTitle>Edit Ranklist Weight</DialogTitle>
          <DialogDescription>
            Adjust the weight of this ranklist for the event scoring
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="border rounded-md p-4">
            <div className="font-medium">{ranklist.rankList.keyword}</div>
            <div className="flex items-center mt-2 space-x-2">
              <Badge variant="outline">{ranklist.rankList.tracker.title}</Badge>
              {ranklist.rankList.description && (
                <span className="text-xs text-muted-foreground">
                  {ranklist.rankList.description}
                </span>
              )}
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
                Set the weight of this ranklist in the event (0.0 to 1.0)
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
            disabled={isUpdating || weight === ranklist.weight}
          >
            {isUpdating ? "Updating..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
