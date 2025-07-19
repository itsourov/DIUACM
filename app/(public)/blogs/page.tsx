import { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { getAllPublicBlogs } from "./actions";
import { BlogCard } from "./components/blog-card";

export const metadata: Metadata = {
  title: "Blog - DIU ACM",
  description: "Read the latest articles and news from DIU ACM",
};

export default async function BlogsPage() {
  // Get all blogs without pagination
  const blogs = await getAllPublicBlogs();

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Our{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
            Blog
          </span>
        </h1>
        <div className="mx-auto w-20 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mb-6"></div>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Read the latest articles, tutorials, and news from DIU ACM
        </p>
      </div>

      {/* Blog Grid */}
      {blogs.length > 0 ? (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
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
    </div>
  );
}
