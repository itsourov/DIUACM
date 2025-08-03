import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getForumCategories } from "../actions";
import { ForumPostForm } from "../components/forum-post-form";

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
      <ForumPostForm categories={categories} mode="create" />
    </div>
  );
}
