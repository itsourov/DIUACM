"use client";

import { useState } from "react";
import { Edit3 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateUserScore } from "../../../actions";

interface EditScoreDialogProps {
  ranklistId: number;
  userId: string;
  userName: string;
  currentScore: number;
}

export function EditScoreDialog({
  ranklistId,
  userId,
  userName,
  currentScore,
}: EditScoreDialogProps) {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(currentScore.toString());
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newScore = parseFloat(score);
    if (isNaN(newScore)) {
      toast.error("Please enter a valid score");
      return;
    }

    setIsLoading(true);

    try {
      const response = await updateUserScore(ranklistId, userId, newScore);

      if (response.success) {
        toast.success(`Score updated successfully for ${userName}`);
        setOpen(false);
        // Reset form
        setScore(newScore.toString());
        // The page will automatically revalidate due to server action
      } else {
        toast.error(response.error || "Failed to update score");
      }
    } catch (error) {
      console.error("Error updating score:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen);
      if (newOpen) {
        // Reset score to current value when opening
        setScore(currentScore.toString());
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit3 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Score</DialogTitle>
          <DialogDescription>
            Update the score for {userName} in this ranklist.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="score">Score</Label>
              <Input
                id="score"
                name="score"
                type="number"
                step="0.01"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Enter new score"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Score"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
