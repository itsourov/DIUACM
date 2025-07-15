import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { RolePermissionsForm } from "./components/role-permissions-form";
import { getRoleById, getRolePermissions } from "../../actions";

export const metadata: Metadata = {
    title: "Manage Role Permissions | DIU ACM Admin",
    description: "Assign permissions to role",
};

interface RolePermissionsPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function RolePermissionsPage({ params }: RolePermissionsPageProps) {
    const { id } = await params;
    const roleId = parseInt(id, 10);

    if (isNaN(roleId)) {
        notFound();
    }

    const [roleResponse, permissionsResponse] = await Promise.all([
        getRoleById(roleId),
        getRolePermissions(roleId),
    ]);

    if (!roleResponse.success || !roleResponse.data) {
        notFound();
    }

    if (!permissionsResponse.success) {
        notFound();
    }

    const role = roleResponse.data;
    const rolePermissions = permissionsResponse.data || [];

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
                                {role.name} Permissions
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Manage Permissions</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Assign permissions to the <strong>{role.name}</strong> role
                    </p>
                </div>
            </div>

            <RolePermissionsForm
                roleId={roleId}
                roleName={role.name}
                initialPermissions={rolePermissions}
            />
        </div>
    );
} 