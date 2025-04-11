import { redirect } from "next/navigation";
import { Metadata } from "next";
import { Shield } from "lucide-react";

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
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Edit Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update your personal information and competitive programming profiles
        </p>
      </div>

      <div className="mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-800 dark:text-blue-300">
              Privacy Note
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Your email address is managed by your authentication provider and
              cannot be changed here. Other profile information will be visible
              on your public profile page.
            </p>
          </div>
        </div>
      </div>

      <ProfileForm userData={userData} />
    </div>
  );
}
