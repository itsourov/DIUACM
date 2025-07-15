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
import { deleteRanklist } from "../actions";
import { cn } from "@/lib/utils";

interface DeleteRanklistButtonProps {
    id: number;
    trackerId: number;
    keyword: string;
    hasAttachments?: boolean;
    eventCount?: number;
    userCount?: number;
    variant?: VariantProps<typeof buttonVariants>["variant"];
    size?: VariantProps<typeof buttonVariants>["size"];
    className?: string;
    showIcon?: boolean;
    showText?: boolean;
}

export function DeleteRanklistButton({
    id,
    trackerId,
    keyword,
    hasAttachments = false,
    eventCount = 0,
    userCount = 0,
    variant = "ghost",
    size = "sm",
    className,
    showIcon = true,
    showText = false,
}: DeleteRanklistButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await deleteRanklist(id, trackerId);

            if (response.success) {
                toast.success(response.message || "Ranklist deleted successfully!");
                setIsOpen(false);
            } else {
                toast.error(response.error || "Failed to delete ranklist");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const totalAttachments = eventCount + userCount;

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
                            Delete Ranklist
                        </>
                    )}
                    {!showText && <span className="sr-only">Delete ranklist</span>}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Ranklist</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the ranklist <strong>&quot;{keyword}&quot;</strong>?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4">
                    {hasAttachments && totalAttachments > 0 && (
                        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
                            <p className="text-yellow-800 text-sm font-medium">
                                ⚠️ Warning: This ranklist has {eventCount} event{eventCount !== 1 ? 's' : ''} and {userCount} user{userCount !== 1 ? 's' : ''} attached.
                            </p>
                            <p className="text-yellow-700 text-sm">
                                You must remove all attachments before deleting this ranklist.
                            </p>
                        </div>
                    )}
                    {(!hasAttachments || totalAttachments === 0) && (
                        <p className="text-destructive font-medium">
                            This action cannot be undone.
                        </p>
                    )}
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting || (hasAttachments && totalAttachments > 0)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {hasAttachments && totalAttachments > 0 ? "Cannot Delete" : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
} 