"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { ranklistFormSchema, type RanklistFormValues } from "../schemas/ranklist";
import { createRanklist, updateRanklist } from "../actions";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List, Loader2 } from "lucide-react";

interface Ranklist {
    id: number;
    trackerId: number;
    keyword: string;
    description?: string | null;
    weightOfUpsolve: number;
    order: number;
    isActive: boolean;
    considerStrictAttendance: boolean;
    createdAt?: Date | null;
    updatedAt?: Date | null;
}

interface RanklistFormProps {
    trackerId: number;
    initialData?: Ranklist | null;
    isEditing?: boolean;
    onSuccess?: () => void;
}

export function RanklistForm({
    trackerId,
    initialData,
    isEditing = false,
    onSuccess,
}: RanklistFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RanklistFormValues>({
        resolver: zodResolver(ranklistFormSchema),
        defaultValues: initialData
            ? {
                keyword: initialData.keyword,
                description: initialData.description || "",
                weightOfUpsolve: initialData.weightOfUpsolve,
                order: initialData.order,
                isActive: initialData.isActive,
                considerStrictAttendance: initialData.considerStrictAttendance,
            }
            : {
                keyword: "",
                description: "",
                weightOfUpsolve: 0.5,
                order: 0,
                isActive: true,
                considerStrictAttendance: true,
            },
    });

    const onSubmit = async (values: RanklistFormValues) => {
        setIsLoading(true);
        try {
            let response;

            if (isEditing && initialData?.id) {
                response = await updateRanklist(initialData.id, trackerId, values);
            } else {
                response = await createRanklist(trackerId, values);
            }

            if (response.success) {
                toast.success(
                    response.message ||
                    (isEditing
                        ? "Ranklist updated successfully!"
                        : "Ranklist created successfully!")
                );
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push(`/admin/trackers/${trackerId}/ranklists`);
                }
            } else {
                toast.error(response.error || "Something went wrong");
            }
        } catch (error) {
            console.error("Form submission error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <div className="rounded-full bg-primary/10 p-2">
                        <List className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle>
                            {isEditing ? "Edit Ranklist" : "Create New Ranklist"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {isEditing
                                ? "Update ranklist settings and configuration"
                                : "Add a new ranklist to track user progress"}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="keyword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Keyword</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter ranklist keyword"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Unique identifier for this ranklist
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="weightOfUpsolve"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Weight of Upsolve</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="1"
                                                placeholder="0.5"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Weight for upsolve calculations (0.0 - 1.0)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="order"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Order</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Display order (lower numbers appear first)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Active</FormLabel>
                                                <FormDescription>
                                                    Whether this ranklist is currently active
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="considerStrictAttendance"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">
                                                    Consider Strict Attendance
                                                </FormLabel>
                                                <FormDescription>
                                                    Consider strict attendance rules for calculations
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter ranklist description..."
                                            rows={4}
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Optional description of this ranklist&apos;s purpose
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? "Update Ranklist" : "Create Ranklist"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(`/admin/trackers/${trackerId}/ranklists`)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
} 