import { redirect } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { ChangePasswordForm } from "./components/change-password-form";

export const metadata: Metadata = {
  title: "Change Password | DIU ACM",
  description: "Change your account password",
};

export default async function ChangePasswordPage() {
  // Check authentication with NextAuth
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <ChangePasswordForm />
    </div>
  );
}
