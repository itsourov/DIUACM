import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getPermission } from "../../actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { PermissionForm } from "../../components/permission-form";

interface EditPermissionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Edit Permission | DIU ACM Admin",
  description: "Edit permission details",
};

export default async function EditPermissionPage({
  params,
}: EditPermissionPageProps) {
  const resolvedParams = await params;
  const permissionId = resolvedParams.id;

  if (!permissionId) {
    notFound();
  }

  const { data: permission, error } = await getPermission(permissionId);

  if (error || !permission) {
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
                <Link href="/admin/permissions">Permissions</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-foreground font-medium">
                Edit Permission
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Permission: {permission.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Modify permission details
            </p>
          </div>
        </div>
      </div>

      <PermissionForm
        initialData={permission}
        isEditing
        permissionId={permissionId}
      />
    </div>
  );
}
