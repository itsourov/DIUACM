import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getForumCategories } from "../actions";
import { CreatePostForm } from "./components/create-post-form";

export const metadata: Metadata = {
  title: "Create Post - Forum - DIU ACM",
  description: "Create a new forum post to share with the community.",
};

export default async function CreatePostPage() {
  const session = await auth();

  // Require authentication to create posts
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/forum/create");
  }

  const categories = await getForumCategories();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Create New Post
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Share your thoughts, questions, or ideas with the community.
          </p>
        </div>

        {/* Create Post Form */}
        <CreatePostForm categories={categories} />
      </div>
    </div>
  );
}
