"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

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

interface GenericDeleteButtonProps {
    id: string;
    name: string;
    entityName: string;
    deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>;
    isDisabled?: boolean;
    disabledReason?: string;
}

export function GenericDeleteButton({
    id,
    name,
    entityName,
    deleteAction,
    isDisabled = false,
    disabledReason,
}: GenericDeleteButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const onDelete = async () => {
        setIsLoading(true);

        try {
            const response = await deleteAction(id);

            if (response.success) {
                toast.success(`${entityName} deleted successfully`);
                setOpen(false);
            } else {
                toast.error(response.error || "Something went wrong");
            }
        } catch (error) {
            console.error(error);
            toast.error(`Failed to delete ${entityName.toLowerCase()}.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive"
                    disabled={isDisabled}
                    title={isDisabled ? disabledReason : `Delete ${entityName.toLowerCase()}`}
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the {entityName.toLowerCase()} <strong>{name}</strong>.
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onDelete}
                        className="bg-destructive hover:bg-destructive/90"
                        disabled={isLoading}
                    >
                        {isLoading ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
} 