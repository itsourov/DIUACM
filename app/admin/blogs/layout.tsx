import { hasPermission } from "@/lib/authorization";
import UnauthorizedPage from "../unauthorized/page";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await hasPermission("BLOGS:MANAGE"))) {
    return UnauthorizedPage();
  }
  return children;
}
