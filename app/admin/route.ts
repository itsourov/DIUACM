import { redirect } from "next/navigation";

// Redirect from /admin to /admin/dashboard
export function GET() {
  return redirect("/admin/dashboard");
}
