"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
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
import { deleteTracker } from "../actions";
import { cn } from "@/lib/utils";

interface DeleteTrackerButtonProps {
    id: number;
    title: string;
    hasRankLists?: boolean;
    rankListCount?: number;
    variant?: VariantProps<typeof buttonVariants>["variant"];
    size?: VariantProps<typeof buttonVariants>["size"];
    className?: string;
    showIcon?: boolean;
    showText?: boolean;
}

export function DeleteTrackerButton({
    id,
    title,
    hasRankLists = false,
    rankListCount = 0,
    variant = "ghost",
    size = "sm",
    className,
    showIcon = true,
    showText = false,
}: DeleteTrackerButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await deleteTracker(id);

            if (response.success) {
                toast.success(response.message || "Tracker deleted successfully!");
                setIsOpen(false);
            } else {
                toast.error(response.error || "Failed to delete tracker");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    className={cn(
                        showText ? "" : "text-destructive hover:text-destructive",
                        className
                    )}
                >
                    {showIcon && <Trash2 className="h-4 w-4" />}
                    {showText && (
                        <>
                            {showIcon && <span className="mr-2" />}
                            Delete Tracker
                        </>
                    )}
                    {!showText && <span className="sr-only">Delete tracker</span>}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Tracker</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the tracker <strong>&quot;{title}&quot;</strong>?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4">
                    {hasRankLists && rankListCount > 0 && (
                        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
                            <p className="text-yellow-800 text-sm font-medium">
                                ⚠️ Warning: This tracker has {rankListCount} ranklist{rankListCount !== 1 ? 's' : ''}.
                            </p>
                            <p className="text-yellow-700 text-sm">
                                You must delete all ranklists before deleting this tracker.
                            </p>
                        </div>
                    )}
                    {(!hasRankLists || rankListCount === 0) && (
                        <p className="text-destructive font-medium">
                            This action cannot be undone.
                        </p>
                    )}
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting || (hasRankLists && rankListCount > 0)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {hasRankLists && rankListCount > 0 ? "Cannot Delete" : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
} 