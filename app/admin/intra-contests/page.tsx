import Link from "next/link";
import { Metadata } from "next";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
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
import { CustomPagination } from "@/components/custom-pagination";
import { getPaginatedIntraContests, deleteIntraContest } from "./actions";
import { DeleteButton } from "../components/delete-button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Calendar, Plus, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import { SearchIntraContests } from "./components/search-intra-contests";

export const metadata: Metadata = {
  title: "Intra Contests | DIU ACM Admin",
  description: "Manage intra contests",
};

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function IntraContestsPage({ searchParams }: PageProps) {
  const awaitedSearchParams = await searchParams;
  const page = parseInt(awaitedSearchParams.page ?? "1", 10);
  const search = awaitedSearchParams.search || undefined;

  const { data } = await getPaginatedIntraContests(page, 10, search);

  const items = data?.items ?? [];
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
                Intra Contests
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Intra Contests
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage DIU ACM intra contests
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/intra-contests/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Intra Contest
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-xl">Intra Contests List</CardTitle>
            <CardDescription>Total: {pagination.totalCount}</CardDescription>
          </div>
          <SearchIntraContests />
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No intra contests found.
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[260px]">Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registration</TableHead>
                      <TableHead>Main Event</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="space-y-1.5">
                            <div className="font-medium text-base">
                              {item.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              /{item.slug}
                            </div>
                            {item.bannerImage && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <ImageIcon className="h-3.5 w-3.5 mr-1" />
                                <span className="truncate max-w-[220px]">
                                  Banner set
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.status === "published" ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <Eye className="h-3 w-3 mr-1" /> Published
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <EyeOff className="h-3 w-3 mr-1" /> Draft
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span>
                              From:{" "}
                              {item.registrationStartTime
                                ? format(
                                    new Date(item.registrationStartTime),
                                    "PPp"
                                  )
                                : "-"}
                            </span>
                            <span>
                              To:{" "}
                              {item.registrationEndTime
                                ? format(
                                    new Date(item.registrationEndTime),
                                    "PPp"
                                  )
                                : "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span>
                              {item.mainEventDateTime
                                ? format(
                                    new Date(item.mainEventDateTime),
                                    "PPp"
                                  )
                                : "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{item.registrationFee}</div>
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
                                href={`/admin/intra-contests/${item.id}/edit`}
                              >
                                Edit
                              </Link>
                            </Button>
                            <DeleteButton
                              id={item.id}
                              itemName={item.name}
                              itemType="Intra Contest"
                              onDelete={deleteIntraContest}
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
