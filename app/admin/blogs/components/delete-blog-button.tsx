"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { deleteBlog } from "../actions";

interface DeleteBlogButtonProps {
    id: number;
    title: string;
    showText?: boolean;
    className?: string;
    variant?: "ghost" | "default" | "destructive" | "outline" | "secondary" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    asDropdownItem?: boolean;
}

export function DeleteBlogButton({
    id,
    title,
    showText = false,
    className,
    variant = "ghost",
    size = "sm",
    asDropdownItem = false,
}: DeleteBlogButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const result = await deleteBlog(id);

            if (result.success) {
                toast.success(result.message || "Blog post deleted successfully");
                setIsOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete blog post");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const TriggerComponent = asDropdownItem ? (
        <DropdownMenuItem
            className={className}
            onSelect={(e) => {
                e.preventDefault();
                setIsOpen(true);
            }}
        >
            <Trash2 className="h-4 w-4" />
            {showText && <span className="ml-2">Delete</span>}
        </DropdownMenuItem>
    ) : (
        <Button
            variant={variant}
            size={size}
            className={className}
        >
            <Trash2 className="h-4 w-4" />
            {showText && <span className="ml-2">Delete</span>}
            <span className="sr-only">Delete blog post</span>
        </Button>
    );

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                {TriggerComponent}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete &quot;{title}&quot;? This action
                        cannot be undone and will permanently remove the blog post from the
                        system.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isLoading ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
} 