import { auth } from "@/lib/auth";
import UnauthorizedPage from "./unauthorized/page";
import { AdminLayout } from "./components/admin-layout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user)
    return (
      <AdminLayout>
        <UnauthorizedPage />
      </AdminLayout>
    );
  return <AdminLayout>{children}</AdminLayout>;
}
