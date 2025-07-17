import Link from "next/link";
import { BookOpen, Plus, Calendar, MessageSquare, Pencil } from "lucide-react";
import { Metadata } from "next";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CustomPagination } from "@/components/custom-pagination";
import { getPaginatedBlogs, deleteBlog } from "./actions";
import { DeleteButton } from "../components/delete-button";
import { SearchBlogs } from "./components/search-blogs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Blog Management | DIU ACM Admin",
  description: "Manage all your blog posts in one place",
};

interface BlogsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

// Define badge variant types
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const awaitedSearchParams = await searchParams;
  const page = parseInt(awaitedSearchParams.page ?? "1", 10);
  const search = awaitedSearchParams.search || undefined;

  const { data } = await getPaginatedBlogs(page, 10, search);

  const blogs = data?.blogs ?? [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
  };

  // Helper function to determine badge variant based on blog status
  const getStatusVariant = (status: string): BadgeVariant => {
    switch (status) {
      case "published":
        return "default"; // Use default (blue) for published
      case "draft":
        return "secondary"; // Use secondary (gray) for drafts
      case "private":
        return "outline"; // Use outline for private
      default:
        return "default";
    }
  };

  // Format date for display
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Not published";
    return format(new Date(date), "MMM d, yyyy");
  };

  // Truncate content for preview
  const truncateContent = (content: string | null, maxLength: number = 40) => {
    if (!content) return "No content";
    return content.length > maxLength
      ? `${content.substring(0, maxLength)}...`
      : content;
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
              <BreadcrumbLink className="text-foreground font-medium">
                Blog Posts
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Blog Posts</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your website content and articles
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/blogs/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Blog Post
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-xl">Blog Posts</CardTitle>
            <CardDescription>
              Total: {pagination.totalCount} post
              {pagination.totalCount !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <SearchBlogs />
        </CardHeader>
        <CardContent>
          {blogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <div className="rounded-full bg-muted p-3">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                No blog posts found
              </h3>
              {search ? (
                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  No blog posts match your search criteria. Try different
                  filters or create a new post.
                </p>
              ) : (
                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  Get started by creating your first blog post.
                </p>
              )}
              <Button asChild variant="outline" className="mt-2">
                <Link href="/admin/blogs/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Blog Post
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Title</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Published Date
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Author
                      </TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogs.map((blog) => (
                      <TableRow key={blog.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-base">
                              {blog.title}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {truncateContent(blog.content)}
                            </div>
                            {blog.isFeatured && (
                              <Badge variant="outline" className="text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={getStatusVariant(blog.status)}>
                            {blog.status.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDate(blog.publishedAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center">
                            <MessageSquare className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span className="text-sm">
                              {blog.author || "Anonymous"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              asChild
                            >
                              <Link
                                href={`/admin/blogs/${blog.id}/edit`}
                                className="flex items-center justify-center"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <DeleteButton id={blog.id} onDelete={deleteBlog} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-6 flex justify-center">
                <CustomPagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
