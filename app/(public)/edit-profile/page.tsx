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
      <ProfileForm user={result.data} />
    </div>
  );
}
