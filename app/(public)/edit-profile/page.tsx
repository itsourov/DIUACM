import { redirect } from "next/navigation";
import { Metadata } from "next";
import { UserCog, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "./actions";
import { ProfileForm } from "./components/profile-form";

export const metadata: Metadata = {
  title: "Edit Profile - DIU ACM",
  description:
    "Update your personal information and competitive programming profiles",
};

export default async function EditProfilePage() {
  // Get current user data
  const { success, data: userData } = await getCurrentUser();

  // Redirect to login if not authenticated
  if (!success || !userData) {
    redirect("/login");
  }

  return (
    <div className="relative py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          asChild
          variant="ghost"
          className="mb-6 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <Link href={`/programmers/${userData.username}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
        </Button>

        <div className="mb-8 flex items-center">
          <div className="mr-4 h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-400 flex items-center justify-center shadow-lg">
            <UserCog className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Edit Profile
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Update your personal information
            </p>
          </div>
        </div>

        <ProfileForm userData={userData} />
      </div>
    </div>
  );
}
