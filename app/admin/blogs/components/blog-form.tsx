"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { VisibilityStatus, type BlogPost } from "@/db/schema";
import { blogFormSchema, type BlogFormValues } from "../schemas/blog";
import { createBlog, updateBlog } from "../actions";
import { ImageUpload } from "./image-upload";
import MarkdownEditorWrapper from "./markdown-editor-wrapper";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { FileText, Calendar, User } from "lucide-react";

type Blog = BlogPost;

interface BlogFormProps {
  blog?: Blog;
  mode?: "create" | "edit";
}

export function BlogForm({ blog, mode = "create" }: BlogFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: blog?.title || "",
      slug: blog?.slug || "",
      author: blog?.author || "",
      content: blog?.content || "",
      status: blog?.status || VisibilityStatus.DRAFT,
      featuredImage: blog?.featuredImage || "",
      publishedAt: blog?.publishedAt
        ? new Date(blog.publishedAt).toISOString().split("T")[0]
        : "",
      isFeatured: blog?.isFeatured || false,
    },
  });

  // Auto-generate slug from title
  const watchTitle = form.watch("title");
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Update slug when title changes (only in create mode or if slug is empty)
  useState(() => {
    if (watchTitle && (mode === "create" || !form.getValues("slug"))) {
      const newSlug = generateSlug(watchTitle);
      form.setValue("slug", newSlug);
    }
  });

  async function onSubmit(values: BlogFormValues) {
    setIsLoading(true);
    try {
      const result =
        mode === "create"
          ? await createBlog(values)
          : await updateBlog(blog!.id, values);

      if (result.success) {
        toast.success(
          result.message ||
            `Blog post ${
              mode === "create" ? "created" : "updated"
            } successfully`
        );
        router.push("/admin/blogs");
        router.refresh();
      } else {
        toast.error(result.error || `Failed to ${mode} blog post`);
      }
    } catch (error) {
      console.error(`${mode} error:`, error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {mode === "create" ? "Create New Blog Post" : "Edit Blog Post"}
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
                    <FormLabel>Blog Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter blog title"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      The main title of your blog post
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="blog-post-slug"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      URL-friendly version of the title
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Author
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Author name"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      The author of this blog post
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="featuredImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a featured image for this blog post (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={VisibilityStatus.DRAFT}>
                          Draft
                        </SelectItem>
                        <SelectItem value={VisibilityStatus.PUBLISHED}>
                          Published
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Publication status of the blog post
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publishedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Publish Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>
                      When this blog post should be published (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Featured Post</FormLabel>
                      <FormDescription>
                        Mark this post as featured to highlight it
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <MarkdownEditorWrapper
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    You can use Markdown for formatting and mathematical
                    expressions with KaTeX/MathJax.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : mode === "create"
                  ? "Create Blog Post"
                  : "Update Blog Post"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
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
