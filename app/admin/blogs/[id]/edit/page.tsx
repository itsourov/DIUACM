import { notFound } from "next/navigation";
import { BlogForm } from "../../components/blog-form";
import { getBlog } from "../../actions";
import { Metadata } from "next";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

interface EditBlogPageProps {
    params: Promise<{
        id: string;
    }>;
}

export async function generateMetadata({
    params,
}: EditBlogPageProps): Promise<Metadata> {
    const { id } = await params;
    const blogId = parseInt(id, 10);

    if (isNaN(blogId)) {
        return {
            title: "Blog Not Found | DIU ACM Admin",
        };
    }

    const { data, success } = await getBlog(blogId);

    if (!success || !data) {
        return {
            title: "Blog Not Found | DIU ACM Admin",
        };
    }

    const blog = data as { title: string };

    return {
        title: `Edit ${blog.title} | DIU ACM Admin`,
        description: `Edit blog post: ${blog.title}`,
    };
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
    const { id } = await params;
    const blogId = parseInt(id, 10);

    if (isNaN(blogId)) {
        notFound();
    }

    const { data, success, error } = await getBlog(blogId);

    if (!success || !data) {
        console.error("Failed to fetch blog:", error);
        notFound();
    }

    const blog = data as {
        id: number;
        title: string;
        slug: string;
        author: string;
        content: string;
        status: "published" | "draft";
        publishedAt?: Date | null;
        isFeatured: boolean;
        createdAt?: Date | null;
        updatedAt?: Date | null;
    };

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
                                <Link href="/admin/blogs">Blogs</Link>
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
                            Edit Blog Post
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Update the details of &quot;{blog.title}&quot;
                        </p>
                    </div>
                </div>
            </div>
            <BlogForm blog={blog} mode="edit" />
        </div>
    );
} 