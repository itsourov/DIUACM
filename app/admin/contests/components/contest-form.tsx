"use client";

import { useState, useEffect } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ContestType, type Contest } from "@/db/schema";

import { contestFormSchema, type ContestFormValues } from "../schemas/contest";
import {
  createContest,
  updateContest,
  getPublishedGalleries,
} from "../actions";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Images } from "lucide-react";

interface ContestWithGallery extends Contest {
  gallery?: {
    id: number;
    title: string;
    slug: string;
    status: string;
  } | null;
}

interface ContestFormProps {
  initialData?: ContestWithGallery | null;
  isEditing?: boolean;
}

interface GalleryOption {
  id: number;
  title: string;
}

export function ContestForm({
  initialData,
  isEditing = false,
}: ContestFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [galleries, setGalleries] = useState<GalleryOption[]>([]);
  const [isLoadingGalleries, setIsLoadingGalleries] = useState(true);

  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const response = await getPublishedGalleries();
        if (response.success && response.data) {
          setGalleries(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (response.data as any).map((gallery: any) => ({
              id: gallery.id,
              title: gallery.title,
            }))
          );
        } else {
          toast.error("Failed to load galleries");
        }
      } catch (error) {
        console.error("Error loading galleries:", error);
        toast.error("Error loading galleries");
      } finally {
        setIsLoadingGalleries(false);
      }
    };

    fetchGalleries();
  }, []);

  const form = useForm<ContestFormValues>({
    resolver: zodResolver(contestFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          contestType: initialData.contestType,
          location: initialData.location || "",
          description: initialData.description || "",
          standingsUrl: initialData.standingsUrl || "",
          galleryId: initialData.galleryId || null,
          date: initialData.date
            ? formatDateForInput(initialData.date)
            : formatDateForInput(new Date()),
        }
      : {
          name: "",
          contestType: ContestType.OTHER,
          location: "",
          date: formatDateForInput(new Date()),
          description: "",
          standingsUrl: "",
          galleryId: null,
        },
  });

  const onSubmit = async (values: ContestFormValues) => {
    setIsLoading(true);
    try {
      let result;
      if (isEditing && initialData?.id) {
        result = await updateContest(initialData.id, values);
      } else {
        result = await createContest(values);
      }

      if (result.success) {
        toast.success(
          isEditing
            ? "Contest updated successfully!"
            : "Contest created successfully!"
        );
        router.push("/admin/contests");
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Contest" : "Create New Contest"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contest Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter contest name"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contest Type</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contest type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ContestType.ICPC_REGIONAL}>
                          ICPC Regional
                        </SelectItem>
                        <SelectItem value={ContestType.ICPC_ASIA_WEST}>
                          ICPC Asia West
                        </SelectItem>
                        <SelectItem value={ContestType.IUPC}>IUPC</SelectItem>
                        <SelectItem value={ContestType.OTHER}>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contest Date</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter contest location"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter contest description"
                      className="min-h-[100px]"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="standingsUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Standings URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter standings URL"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="galleryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gallery</FormLabel>
                    <Select
                      disabled={isLoading || isLoadingGalleries}
                      onValueChange={(value) => {
                        field.onChange(
                          value === "none" ? null : parseInt(value)
                        );
                      }}
                      value={field.value?.toString() || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a gallery" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Gallery</SelectItem>
                        {galleries.map((gallery) => (
                          <SelectItem
                            key={gallery.id}
                            value={gallery.id.toString()}
                          >
                            <div className="flex items-center">
                              <Images className="mr-2 h-4 w-4" />
                              <span>{gallery.title}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Link this contest to a photo gallery (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/contests")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : isEditing
                  ? "Update Contest"
                  : "Create Contest"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
