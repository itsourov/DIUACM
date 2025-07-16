"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WeightEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeight: number;
  ranklistTitle: string;
  onSave: (newWeight: number) => Promise<void>;
}

export function WeightEditModal({
  isOpen,
  onClose,
  currentWeight,
  ranklistTitle,
  onSave,
}: WeightEditModalProps) {
  const [weight, setWeight] = useState(currentWeight);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (weight <= 0) {
      return;
    }

    try {
      setIsSaving(true);
      await onSave(weight);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setWeight(currentWeight); // Reset to original value
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Weight</DialogTitle>
          <DialogDescription>
            Update the weight for &quot;{ranklistTitle}&quot;
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weight" className="text-right">
              Weight
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="0.1"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              className="col-span-3"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || weight <= 0}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
