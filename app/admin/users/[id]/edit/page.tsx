import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getUser } from "../../actions";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { UserForm } from "../../components/user-form";

interface EditUserPageProps {
    params: Promise<{
        id: string;
    }>;
}

export const metadata: Metadata = {
    title: "Edit User | DIU QBank Admin",
    description: "Edit user details",
};

export default async function EditUserPage({
    params,
}: EditUserPageProps) {
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    if (!userId) {
        notFound();
    }

    const { data: user, error } = await getUser(userId);

    if (error || !user) {
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
                                <Link href="/admin/users">Users</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink className="text-foreground font-medium">
                                Edit User
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit User: {user.name || user.email}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Modify user details
                        </p>
                    </div>
                </div>
            </div>

            <UserForm initialData={user} isEditing userId={userId} />
        </div>
    );
} 