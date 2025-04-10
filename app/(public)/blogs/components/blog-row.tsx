"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import type { BlogPost } from "../actions";
import { Button } from "@/components/ui/button";

interface BlogRowProps {
  blog: BlogPost;
}

export function BlogRow({ blog }: BlogRowProps) {
  // Format the published date
  const formattedDate = blog.publishedAt
    ? format(new Date(blog.publishedAt), "MMMM d, yyyy")
    : format(new Date(blog.createdAt), "MMMM d, yyyy");

  // Calculate excerpt (first 150 chars - shorter for grid layout)
  const excerpt = blog.content
    ? blog.content.replace(/[#*`]/g, "").substring(0, 150) +
      (blog.content.length > 150 ? "..." : "")
    : "";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col">
      {/* Feature Image */}
      {blog.featuredImage && (
        <div className="aspect-video w-full overflow-hidden relative">
          <Image
            src={blog.featuredImage}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-5 flex flex-col flex-grow">
        {/* Title and meta information */}
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
          <Link
            href={`/blogs/${blog.slug}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {blog.title}
          </Link>
        </h2>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <div className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            {formattedDate}
          </div>
          {blog.author && (
            <div className="flex items-center">
              <User className="mr-1 h-3 w-3" />
              {blog.author}
            </div>
          )}
        </div>

        {/* Blog excerpt */}
        {excerpt && (
          <div className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3 flex-grow">
            {excerpt}
          </div>
        )}

        {/* Read more button */}
        <Button
          asChild
          variant="outline"
          className="h-8 rounded-full text-sm w-full mt-auto"
          size="sm"
        >
          <Link
            href={`/blogs/${blog.slug}`}
            className="flex items-center justify-center"
          >
            Read More
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
