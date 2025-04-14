import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getRole } from "../../actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { UsersRound } from "lucide-react";

import { RoleForm } from "../../components/role-form";

interface EditRolePageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Edit Role | DIU ACM Admin",
  description: "Edit role details and permissions",
};

export default async function EditRolePage({ params }: EditRolePageProps) {
  const resolvedParams = await params;
  const roleId = resolvedParams.id;

  if (!roleId) {
    notFound();
  }

  const { data: role, error } = await getRole(roleId);

  if (error || !role) {
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
              <BreadcrumbLink className="text-foreground font-medium">
                Edit Role
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Role: {role.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Modify role details and permissions
            </p>
          </div>
          <Link href={`/admin/roles/${roleId}/users`}>
            <Button variant="outline">
              <UsersRound className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
          </Link>
        </div>
      </div>

      <RoleForm initialData={role} isEditing roleId={roleId} />
    </div>
  );
}
