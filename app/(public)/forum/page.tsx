import { Metadata } from "next";
import { MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getForumPosts, getForumCategories } from "./actions";
import { ForumFilters } from "./components/forum-filters";
import { ForumPostCard } from "./components/forum-post-card";
import { CustomPagination } from "@/components/custom-pagination";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Forum - DIU ACM",
  description:
    "Join discussions, ask questions, and share knowledge with the DIU ACM community",
};

export interface SearchParams {
  category?: string;
  sortBy?: string;
  page?: string;
  search?: string;
}

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function ForumPage({ searchParams }: PageProps) {
  const session = await auth();

  // Await searchParams to get the actual values
  const awaitedSearchParams = await searchParams;

  // Parse pagination and filter parameters
  const currentPage = awaitedSearchParams.page
    ? parseInt(awaitedSearchParams.page)
    : 1;

  // Get forum data
  const [postsData, categories] = await Promise.all([
    getForumPosts({
      categoryId: awaitedSearchParams.category,
      sortBy:
        (awaitedSearchParams.sortBy as "latest" | "popular" | "trending") ||
        "latest",
      page: currentPage,
      limit: 15,
      search: awaitedSearchParams.search,
    }),
    getForumCategories(),
  ]);

  // Destructure posts data
  const { posts, pagination } = postsData;

  // Determine if there are active filters
  const hasActiveFilters = !!(
    awaitedSearchParams.category ||
    awaitedSearchParams.search ||
    (awaitedSearchParams.sortBy && awaitedSearchParams.sortBy !== "latest")
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">
            Forum
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Join discussions, ask questions, and share knowledge with the
            community
          </p>
        </div>

        <Link href="/forum/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <ForumFilters categories={categories} />
      </div>

      {/* Posts List */}
      {posts.length > 0 ? (
        <div className="space-y-4 mb-8">
          {posts.map((post) => (
            <ForumPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <Card className="p-8 md:p-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
            <MessageSquare className="h-8 w-8 text-slate-500 dark:text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No posts found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            {hasActiveFilters
              ? "Try adjusting your filters or search terms to find more posts."
              : "Be the first to start a discussion in the forum!"}
          </p>
          {session && !hasActiveFilters && (
            <Link href="/forum/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Post
              </Button>
            </Link>
          )}
        </Card>
      )}

      {/* Pagination */}
      {posts.length > 0 && pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <CustomPagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
          />
        </div>
      )}
    </div>
  );
}
