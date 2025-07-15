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
import { RoleForm } from "../../components/role-form";
import { getRoleById } from "../../actions";

export const metadata: Metadata = {
    title: "Edit Role | DIU ACM Admin",
    description: "Edit role details",
};

interface EditRolePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditRolePage({ params }: EditRolePageProps) {
    const { id } = await params;
    const roleId = parseInt(id, 10);

    if (isNaN(roleId)) {
        notFound();
    }

    const { success, data: role } = await getRoleById(roleId);

    if (!success || !role) {
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
                                Edit {role.name}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Role</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Update role details and permissions
                    </p>
                </div>
            </div>

            <RoleForm initialData={role} isEditing={true} />
        </div>
    );
} 