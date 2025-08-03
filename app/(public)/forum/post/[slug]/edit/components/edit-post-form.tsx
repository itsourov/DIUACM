"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateForumPost } from "../../../../actions";
import { ForumPostWithDetails } from "@/db/schema";

type Category = {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  description: string | null;
  postCount: number;
};

type EditPostFormProps = {
  post: ForumPostWithDetails;
  categories: Category[];
};

export function EditPostForm({ post, categories }: EditPostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: post.title,
    content: post.content,
    categoryId: post.categoryId.toString(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Please enter content");
      return;
    }

    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateForumPost(post.id, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        categoryId: parseInt(formData.categoryId),
      });

      if (result.success) {
        toast.success("Post updated successfully!");
        router.push(`/forum/post/${post.slug}`);
      } else {
        toast.error("Failed to update post");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update post"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Back to Post */}
      <div>
        <Link href={`/forum/post/${post.slug}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Post
          </Button>
        </Link>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 px-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="title"
              placeholder="Enter a descriptive title for your post"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              maxLength={200}
              required
            />
            <div className="text-xs text-slate-500">
              {formData.title.length}/200 characters
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category *
            </Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => handleInputChange("categoryId", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: category.color || "#6B7280",
                        }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              Content *
            </Label>
            <Textarea
              id="content"
              placeholder="Write your post content here..."
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              className="min-h-[300px] resize-none"
              maxLength={10000}
              required
            />
            <div className="text-xs text-slate-500">
              {formData.content.length}/10,000 characters
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Link href={`/forum/post/${post.slug}`}>
              <Button variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {isSubmitting ? "Updating..." : "Update Post"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
