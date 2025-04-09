import Link from "next/link";
import { BadgeInfo, Plus, Users, Code, Pencil } from "lucide-react";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { CustomPagination } from "@/components/custom-pagination";
import { getPaginatedUsers } from "./actions";
import { DeleteUserButton } from "./components/delete-user-button";
import { SearchUsers } from "./components/search-users";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "Users Management | DIU ACM Admin",
  description: "Manage all your users in one place",
};

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const awaitedSearchParams = await searchParams;
  const page = parseInt(awaitedSearchParams.page ?? "1", 10);
  const search = awaitedSearchParams.search || undefined;

  const { data } = await getPaginatedUsers(page, 10, search);

  const users = data?.users ?? [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
  };

  // Function to create avatar initials from a name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
                Users
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Users</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your system users
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/users/create">
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-xl">Users List</CardTitle>
            <CardDescription>
              Total: {pagination.totalCount} user
              {pagination.totalCount !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <SearchUsers />
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <div className="rounded-full bg-muted p-3">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No users found</h3>
              {search ? (
                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  No users match &quot;{search}&quot;. Try a different search
                  term or create a new user.
                </p>
              ) : (
                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  Get started by creating your first user.
                </p>
              )}
              <Button asChild variant="outline" className="mt-2">
                <Link href="/admin/users/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create User
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[220px]">
                        User Details
                      </TableHead>
                      <TableHead>Student Info</TableHead>
                      <TableHead>Competitive Profiles</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage
                                src={user.image || undefined}
                                alt={user.name}
                              />
                              <AvatarFallback>
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <div className="font-medium text-base">
                                {user.name}
                              </div>
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {user.email}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.studentId && (
                            <div className="flex items-center space-x-1 mb-1">
                              <Badge variant="outline" className="text-xs">
                                ID: {user.studentId}
                              </Badge>
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            {user.department ? `${user.department}` : ""}
                            {user.department && user.startingSemester
                              ? " • "
                              : ""}
                            {user.startingSemester
                              ? `${user.startingSemester}`
                              : ""}
                            {!user.department &&
                              !user.startingSemester &&
                              "No department info"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {user.codeforcesHandle && (
                              <div className="flex items-center">
                                <Code className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                <span className="text-sm">
                                  CF: {user.codeforcesHandle}
                                  {user.maxCfRating && ` (${user.maxCfRating})`}
                                </span>
                              </div>
                            )}
                            {user.atcoderHandle && (
                              <div className="flex items-center">
                                <Code className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                <span className="text-sm">
                                  AC: {user.atcoderHandle}
                                </span>
                              </div>
                            )}
                            {user.vjudgeHandle && (
                              <div className="flex items-center">
                                <Code className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                <span className="text-sm">
                                  VJ: {user.vjudgeHandle}
                                </span>
                              </div>
                            )}
                            {!user.codeforcesHandle &&
                              !user.atcoderHandle &&
                              !user.vjudgeHandle && (
                                <span className="text-sm text-muted-foreground">
                                  No profiles linked
                                </span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <BadgeInfo className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                              <span className="text-sm">
                                {user._count.eventAttendances} event
                                {user._count.eventAttendances !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <BadgeInfo className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                              <span className="text-sm">
                                {user._count.rankListUsers} rank list
                                {user._count.rankListUsers !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
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
                                href={`/admin/users/${user.id}/edit`}
                                className="flex items-center justify-center"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <DeleteUserButton id={user.id} name={user.name} />
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
