import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { format } from "date-fns";
import { Calendar, User, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { getBlogBySlug } from "../actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Import KaTeX CSS for math rendering
import "katex/dist/katex.min.css";

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: blog } = await getBlogBySlug(resolvedParams.slug);

  if (!blog) {
    return {
      title: "Blog Post Not Found - DIU ACM",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `${blog.title} - DIU ACM Blog`,
    description:
      blog.content?.substring(0, 160) || "Read this article on DIU ACM Blog",
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  // Await params to get the actual values
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Fetch the blog post
  const { data: blog } = await getBlogBySlug(slug);

  // If blog post not found, show 404
  if (!blog) {
    notFound();
  }

  // Format the published date
  const formattedDate = blog.publishedAt
    ? format(new Date(blog.publishedAt), "MMMM d, yyyy")
    : format(new Date(blog.createdAt), "MMMM d, yyyy");

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div>
        {/* Back to blog list link */}
        <div className="mb-8">
          <Button
            asChild
            variant="ghost"
            className="pl-0 hover:pl-2 transition-all duration-200"
          >
            <Link
              href="/blogs"
              className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Blog post header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            {/* Blog title */}
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              {blog.title}
            </h1>

            {/* Blog meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                {formattedDate}
              </div>
              {blog.author && (
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  {blog.author}
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Blog content with math formula support */}
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[
                  [rehypeKatex, { throwOnError: false, strict: false }],
                ]}
              >
                {blog.content || "No content available."}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Back to blog list button */}
        <div className="flex justify-center mt-8">
          <Button asChild variant="outline" className="rounded-full px-6">
            <Link href="/blogs">
              <span>Back to Blog</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
