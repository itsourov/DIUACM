import Link from "next/link";
import {
  FileText,
  Plus,
  Calendar,
  Pencil,
  User,
  Settings,
  Eye,
  Star,
} from "lucide-react";
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
import { getPaginatedBlogs } from "./actions";
import { DeleteBlogButton } from "./components/delete-blog-button";
import { SearchBlogs } from "./components/search-blogs";
import { type BlogPost } from "@/db/schema";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

type Blog = BlogPost;

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const awaitedSearchParams = await searchParams;
  const page = parseInt(awaitedSearchParams.page ?? "1", 10);
  const search = awaitedSearchParams.search || undefined;

  const { data } = await getPaginatedBlogs(page, 10, search);

  const blogsData = data as
    | {
        blogs: Blog[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalCount: number;
          pageSize: number;
        };
      }
    | undefined;
  const blogs = blogsData?.blogs ?? [];
  const pagination = blogsData?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default">Published</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
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
                Blogs
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Blog Posts</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage all your blog posts and articles
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
            <CardTitle className="text-xl">Blog Posts List</CardTitle>
            <CardDescription>
              Total: {pagination.totalCount} blog post
              {pagination.totalCount !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <SearchBlogs />
        </CardHeader>
        <CardContent>
          {blogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <div className="rounded-full bg-muted p-3">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                No blog posts found
              </h3>
              {search ? (
                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  No blog posts match &quot;{search}&quot;. Try a different
                  search term or create a new blog post.
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
                      <TableHead className="min-w-[300px]">
                        Blog Details
                      </TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogs.map((blog: Blog) => (
                      <TableRow key={blog.id}>
                        <TableCell>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-base">
                                {blog.title}
                              </div>
                              {blog.isFeatured && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {truncateContent(blog.content)}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <span className="font-mono">/{blog.slug}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <User className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span>{blog.author}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(blog.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span>
                              {blog.publishedAt
                                ? format(new Date(blog.publishedAt), "PP")
                                : "Not published"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <Settings className="h-4 w-4" />
                                  <span className="sr-only">Blog actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/blogs/${blog.id}/edit`}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit Blog Post
                                  </Link>
                                </DropdownMenuItem>
                                {blog.status === "published" && (
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/blogs/${blog.slug}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Post
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DeleteBlogButton
                                  id={blog.id}
                                  title={blog.title}
                                  className="text-destructive focus:text-destructive"
                                  showText={true}
                                  asDropdownItem={true}
                                />
                              </DropdownMenuContent>
                            </DropdownMenu>
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
