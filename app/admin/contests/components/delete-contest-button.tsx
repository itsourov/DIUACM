"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { type VariantProps } from "class-variance-authority";
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

import { deleteContest } from "../actions";
import { cn } from "@/lib/utils";

interface DeleteContestButtonProps {
  id: number;
  name: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

export function DeleteContestButton({
  id,
  name,
  variant = "ghost",
  size = "sm",
  className,
  showIcon = true,
  showText = false,
}: DeleteContestButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const onDelete = async () => {
    setIsLoading(true);

    try {
      const response = await deleteContest(id);

      if (response.success) {
        toast.success(response.message || "Contest deleted successfully");
        setOpen(false);
      } else {
        toast.error(response.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Delete contest error:", error);
      toast.error("Failed to delete contest. " + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            "text-destructive hover:text-destructive",
            !showText && "h-8 w-8 p-0",
            className
          )}
          disabled={isLoading}
        >
          {showIcon && <Trash2 className={cn("h-4 w-4", showText && "mr-2")} />}
          {showText && "Delete"}
          {!showText && <span className="sr-only">Delete contest {name}</span>}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Contest</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete the contest{" "}
            <strong>&quot;{name}&quot;</strong>? This will also delete all
            associated teams and team members. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Contest"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
