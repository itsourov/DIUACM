import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getRole } from "../../actions";
import { getRoleUsers } from "./actions";
import { UsersList } from "./components/users-list";

interface UsersPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: UsersPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const roleId = resolvedParams.id;

  const { data: role } = await getRole(roleId);

  if (!role) {
    return {
      title: "Not Found",
      description: "The requested resource could not be found",
    };
  }

  return {
    title: `Role Users - ${role.name} | DIU ACM Admin`,
    description: `Manage users for ${role.name} role`,
  };
}

export default async function RoleUsersPage({ params }: UsersPageProps) {
  const resolvedParams = await params;
  const roleId = resolvedParams.id;

  if (!roleId) {
    notFound();
  }

  const [roleResponse, usersResponse] = await Promise.all([
    getRole(roleId),
    getRoleUsers(roleId),
  ]);

  const role = roleResponse.data;
  const users = usersResponse.data || [];

  if (!role) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/roles">Roles</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/admin/roles/${roleId}/edit`}>{role.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-foreground font-medium">
                Role Users
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Role Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage users for role &quot;{role.name}&quot;
          </p>
        </div>
      </div>
      <UsersList roleId={roleId} initialUsers={users} />
    </div>
  );
}
