"use client";

import { useState } from "react";
import { toast } from "sonner";
import { User, RankListUser } from "@prisma/client";
import { updateUserScore } from "@/app/admin/trackers/[id]/ranklists/[ranklistId]/users/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

type UserData = Pick<
  User,
  | "id"
  | "name"
  | "email"
  | "username"
  | "image"
  | "studentId"
  | "department"
  | "codeforcesHandle"
  | "atcoderHandle"
  | "vjudgeHandle"
>;

type UserWithData = RankListUser & {
  user: UserData;
};

interface EditScoreDialogProps {
  ranklistId: string;
  user: UserWithData;
  onClose: () => void;
  onScoreUpdated: (user: UserWithData) => void;
}

export function EditScoreDialog({
  ranklistId,
  user,
  onClose,
  onScoreUpdated,
}: EditScoreDialogProps) {
  const [score, setScore] = useState(user.score);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateScore = async () => {
    try {
      setIsUpdating(true);
      const response = await updateUserScore(user.id, ranklistId, score);

      if (response.success && response.data) {
        toast.success("Score updated successfully");
        onScoreUpdated(response.data);
      } else {
        toast.error(response.error || "Failed to update score");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User Score</DialogTitle>
          <DialogDescription>
            Adjust the score for this user in the ranklist
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="border rounded-md p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={user.user.image || undefined}
                  alt={user.user.name}
                />
                <AvatarFallback>{getInitials(user.user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{user.user.name}</div>
                <div className="text-sm text-muted-foreground">
                  {user.user.username}{" "}
                  {user.user.studentId && `• ${user.user.studentId}`}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label htmlFor="edit-score">Score: {score.toFixed(2)}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-score"
                  type="number"
                  step="0.01"
                  min="0"
                  value={score}
                  onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
                  className="w-full"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Set the score of this user in the ranklist
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateScore}
            disabled={isUpdating || score === user.score}
          >
            {isUpdating ? "Updating..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
