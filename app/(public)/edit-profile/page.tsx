import { redirect } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getCurrentUser } from "./actions";
import { ProfileForm } from "./components/profile-form";

export const metadata: Metadata = {
  title: "Edit Profile | DIU ACM",
  description: "Update your profile information",
};

export default async function EditProfilePage() {
  // First check authentication with NextAuth
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Then get the full user data
  const result = await getCurrentUser();

  if (!result.success || !result.data) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Edit{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
            Profile
          </span>
        </h1>
        <div className="mx-auto w-20 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mb-6"></div>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Update your personal information and preferences
        </p>
      </div>

      <ProfileForm user={result.data} />
    </div>
  );
}
