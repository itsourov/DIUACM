import Link from "next/link";
import { UsersRound, Plus, Pencil, Shield } from "lucide-react";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CustomPagination } from "@/components/custom-pagination";
import { getPaginatedRoles } from "./actions";
import { DeleteRoleButton } from "./components/delete-role-button";
import { SearchRoles } from "./components/search-roles";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Roles Management | DIU ACM Admin",
  description: "Manage user roles and permissions",
};

interface RolesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function RolesPage({ searchParams }: RolesPageProps) {
  const awaitedSearchParams = await searchParams;
  const page = parseInt(awaitedSearchParams.page ?? "1", 10);
  const search = awaitedSearchParams.search || undefined;

  const { data } = await getPaginatedRoles(page, 10, search);

  const roles = data?.roles ?? [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
  };

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
              <BreadcrumbLink className="text-foreground font-medium">
                Roles
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage roles and their permissions
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/roles/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-xl">Roles List</CardTitle>
            <CardDescription>
              Total: {pagination.totalCount} role
              {pagination.totalCount !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <SearchRoles />
        </CardHeader>
        <CardContent>
          {roles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <div className="rounded-full bg-muted p-3">
                <UsersRound className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No roles found</h3>
              {search ? (
                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  No roles match your search criteria. Try a different search
                  query or create a new role.
                </p>
              ) : (
                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  Get started by creating your first role.
                </p>
              )}
              <Button asChild variant="outline" className="mt-2">
                <Link href="/admin/roles/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Role
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Name</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Description
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Permissions
                      </TableHead>
                      <TableHead className="w-[100px] text-center">
                        Users
                      </TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <div className="font-medium">{role.name}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {role.description || (
                            <span className="text-muted-foreground italic">
                              No description
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.length > 0 ? (
                              role.permissions.length <= 3 ? (
                                role.permissions.map((permission) => (
                                  <Badge
                                    key={permission.id}
                                    variant="outline"
                                    className="flex items-center"
                                  >
                                    <Shield className="h-3 w-3 mr-1" />
                                    {permission.name}
                                  </Badge>
                                ))
                              ) : (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge
                                        variant="outline"
                                        className="flex items-center cursor-help"
                                      >
                                        <Shield className="h-3 w-3 mr-1" />
                                        {role.permissions.length} permissions
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-sm">
                                      <ul className="list-disc ml-4 space-y-1 text-sm">
                                        {role.permissions.map((permission) => (
                                          <li key={permission.id}>
                                            {permission.name}
                                          </li>
                                        ))}
                                      </ul>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )
                            ) : (
                              <span className="text-muted-foreground italic">
                                No permissions
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {role._count?.users || 0}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              asChild
                            >
                              <Link
                                href={`/admin/roles/${role.id}/edit`}
                                className="flex items-center justify-center"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <DeleteRoleButton
                              id={role.id}
                              name={role.name}
                              userCount={role._count?.users || 0}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-6 flex justify-center">
                <CustomPagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
