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
import { PermissionForm } from "../../components/permission-form";
import { getPermissionById } from "../../actions";

export const metadata: Metadata = {
    title: "Edit Permission | DIU ACM Admin",
    description: "Edit permission details",
};

interface EditPermissionPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditPermissionPage({ params }: EditPermissionPageProps) {
    const { id } = await params;
    const permissionId = parseInt(id, 10);

    if (isNaN(permissionId)) {
        notFound();
    }

    const { success, data: permission } = await getPermissionById(permissionId);

    if (!success || !permission) {
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
                                Edit {permission.name}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Permission</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Update permission details
                    </p>
                </div>
            </div>

            <PermissionForm initialData={permission} isEditing={true} />
        </div>
    );
} 