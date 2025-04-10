import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getBlog } from "../../actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { BlogForm } from "../../components/blog-form";

interface EditBlogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Edit Blog Post | DIU ACM Admin",
  description: "Edit blog post details",
};

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const resolvedParams = await params;
  const blogId = resolvedParams.id;

  const { data: blog, error } = await getBlog(blogId);

  if (error || !blog) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/blogs">Blog Posts</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-foreground font-medium">
                Edit Blog Post
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Blog Post: {blog.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Modify your blog post content and settings
            </p>
          </div>
        </div>
      </div>

      <BlogForm initialData={blog} isEditing />
    </div>
  );
}
