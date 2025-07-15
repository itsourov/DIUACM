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
import { getRoleById } from "../../actions";
import { getRoleUsers } from "./actions";
import { UsersList } from "./components/users-list";

interface RoleUsersPageProps {
    params: Promise<{
        id: string;
    }>;
}

export async function generateMetadata({
    params,
}: RoleUsersPageProps): Promise<Metadata> {
    const awaitedParams = await params;
    const roleId = parseInt(awaitedParams.id);

    if (isNaN(roleId)) {
        return {
            title: "Not Found",
            description: "Invalid role ID",
        };
    }

    const roleResponse = await getRoleById(roleId);
    const role = roleResponse.data;

    if (!role) {
        return {
            title: "Not Found",
            description: "The requested role could not be found",
        };
    }

    return {
        title: `Role Users - ${role.name} | DIU ACM Admin`,
        description: `Manage users assigned to the ${role.name} role`,
    };
}

export default async function RoleUsersPage({ params }: RoleUsersPageProps) {
    const awaitedParams = await params;
    const roleId = parseInt(awaitedParams.id);

    if (isNaN(roleId)) {
        notFound();
    }

    const [roleResponse, usersResponse] = await Promise.all([
        getRoleById(roleId),
        getRoleUsers(roleId),
    ]);

    const role = roleResponse.data;
    const roleUsers = usersResponse.data || [];

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
                                <Link href={`/admin/roles/${roleId}/edit`}>
                                    {role.name}
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink className="text-foreground font-medium">
                                Assigned Users
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Role Users</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage users assigned to the &quot;{role.name}&quot; role
                    </p>
                </div>
            </div>
            <UsersList
                roleId={roleId}
                roleName={role.name}
                initialUsers={roleUsers}
            />
        </div>
    );
} 