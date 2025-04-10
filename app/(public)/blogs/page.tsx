import { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { getPublicBlogs } from "./actions";
import { BlogRow } from "./components/blog-row";
import { CustomPagination } from "@/components/custom-pagination";

export const metadata: Metadata = {
  title: "Blog - DIU ACM",
  description: "Read the latest articles and news from DIU ACM",
};

interface SearchParams {
  page?: string;
}

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function BlogsPage({ searchParams }: PageProps) {
  // Await searchParams to get the actual values
  const awaitedSearchParams = await searchParams;

  // Parse pagination parameters
  const currentPage = awaitedSearchParams.page
    ? parseInt(awaitedSearchParams.page)
    : 1;

  // Get blogs data with pagination
  const blogsData = await getPublicBlogs(currentPage, 12); // Increased to 12 for better grid division

  // Destructure blogs data
  const { blogs, pagination } = blogsData;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">
          Blog
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Read the latest articles, tutorials and news from DIU ACM
        </p>
      </div>

      {/* Results count */}
      <div className="mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 transition-all duration-300 hover:bg-white dark:hover:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                {pagination.total}{" "}
                {pagination.total === 1 ? "Article" : "Articles"}
              </h2>
              {pagination.total > 0 && pagination.pages > 1 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Showing page {pagination.page} of {pagination.pages}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Blog List */}
      {blogs.length > 0 ? (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogRow key={blog.id} blog={blog} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-8 md:p-16 text-center transition-all duration-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
            <BookOpen className="h-8 w-8 text-slate-500 dark:text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No articles found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            There are no blog posts published yet. Check back soon!
          </p>
        </div>
      )}

      {/* Pagination */}
      {blogs.length > 0 && pagination.pages > 1 && (
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
