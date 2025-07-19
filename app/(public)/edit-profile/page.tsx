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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground mt-2">
            Update your personal information and preferences
          </p>
        </div>

        <ProfileForm user={result.data} />
      </div>
    </div>
  );
}
