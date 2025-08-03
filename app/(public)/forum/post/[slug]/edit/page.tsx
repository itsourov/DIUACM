import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getForumPost } from "../actions";
import { getForumCategories } from "../../../actions";
import { EditPostForm } from "./components/edit-post-form";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getForumPost(slug);

    return {
      title: `Edit: ${post.title} - Forum - DIU ACM`,
      description: `Edit your forum post: ${post.title}`,
    };
  } catch {
    return {
      title: "Edit Post - Forum - DIU ACM",
      description: "Edit your forum post.",
    };
  }
}

export default async function EditPostPage({ params }: PageProps) {
  const session = await auth();
  const { slug } = await params;

  // Require authentication
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/forum");
  }

  let post;
  try {
    post = await getForumPost(slug);
  } catch {
    notFound();
  }

  // Check if user is the author
  if (post.authorId !== session.user.id) {
    redirect("/forum");
  }

  const categories = await getForumCategories();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Edit Post
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Make changes to your forum post.
          </p>
        </div>

        {/* Edit Post Form */}
        <EditPostForm post={post} categories={categories} />
      </div>
    </div>
  );
}
