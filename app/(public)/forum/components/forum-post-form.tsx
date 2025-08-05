"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { FileText, MessageSquare, Tag, ArrowLeft, Loader2 } from "lucide-react";
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
import {
  forumPostFormSchema,
  type ForumPostFormValues,
} from "../schemas/forum-post";
import { createForumPost, updateForumPost } from "../actions";
import type { ForumPostWithDetails } from "@/db/schema";

type Category = {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  description: string | null;
  postCount: number;
};

interface ForumPostFormProps {
  post?: ForumPostWithDetails;
  categories: Category[];
  mode?: "create" | "edit";
}

export function ForumPostForm({
  post,
  categories,
  mode = "create",
}: ForumPostFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForumPostFormValues>({
    resolver: zodResolver(forumPostFormSchema),
    defaultValues: {
      title: post?.title || "",
      content: post?.content || "",
      categoryId: post?.categoryId || 0,
    },
  });

  async function onSubmit(values: ForumPostFormValues) {
    setIsLoading(true);
    try {
      const result =
        mode === "create"
          ? await createForumPost(values)
          : await updateForumPost(post!.id, values);

      if (result.success) {
        toast.success(
          result.message ||
            `Post ${mode === "create" ? "created" : "updated"} successfully`
        );

        if (result.slug) {
          router.push(`/forum/post/${result.slug}`);
        } else {
          router.push("/forum");
        }
        router.refresh();
      } else {
        toast.error(result.error || `Failed to ${mode} post`);
      }
    } catch (error) {
      console.error(`${mode} error:`, error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const backUrl =
    mode === "edit" && post ? `/forum/post/${post.slug}` : "/forum";

  const backText = mode === "edit" ? "Back to Post" : "Back to Forum";

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div>
        <Link href={backUrl}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {backText}
          </Button>
        </Link>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {mode === "create" ? "Create New Post" : "Edit Post"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a descriptive title for your post"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        A clear and concise title that describes your post
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Category
                      </FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value ? field.value.toString() : ""}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      category.color || "#6B7280",
                                  }}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the most appropriate category for your post
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Content
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your post content here..."
                        className="min-h-[300px] resize-none"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Share your thoughts, questions, or information. Be clear
                      and helpful to the community.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {isLoading
                    ? `${mode === "create" ? "Creating" : "Updating"}...`
                    : mode === "create"
                    ? "Create Post"
                    : "Update Post"}
                </Button>
                <Link href={backUrl}>
                  <Button type="button" variant="outline" disabled={isLoading}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
