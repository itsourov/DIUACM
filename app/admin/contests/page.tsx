import Link from "next/link";
import {
  Trophy,
  Plus,
  MapPin,
  Calendar,
  Pencil,
  ExternalLink,
  Images,
} from "lucide-react";
import { Metadata } from "next";
import { format } from "date-fns";
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
import { getPaginatedContests } from "./actions";
import { DeleteContestButton } from "./components/delete-contest-button";
import { SearchContests } from "./components/search-contests";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Contests Management | DIU ACM Admin",
  description: "Manage all your programming contests in one place",
};

interface ContestsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function ContestsPage({
  searchParams,
}: ContestsPageProps) {
  const awaitedSearchParams = await searchParams;
  const page = parseInt(awaitedSearchParams.page ?? "1", 10);
  const search = awaitedSearchParams.search || undefined;

  const { data } = await getPaginatedContests(page, 10, search);

  const contests = data?.contests ?? [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
  };

  const getContestTypeBadge = (type: string) => {
    switch (type) {
      case "ICPC_REGIONAL":
        return <Badge variant="default">ICPC Regional</Badge>;
      case "ICPC_ASIA_WEST":
        return <Badge variant="secondary">ICPC Asia West</Badge>;
      case "IUPC":
        return <Badge className="bg-blue-500 hover:bg-blue-600">IUPC</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
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
                Contests
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contests</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage programming contest participation
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/contests/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Contest
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-xl">Contests List</CardTitle>
            <CardDescription>
              Total: {pagination.totalCount} contest
              {pagination.totalCount !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <SearchContests />
        </CardHeader>
        <CardContent>
          {contests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <div className="rounded-full bg-muted p-3">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No contests found</h3>
              {search ? (
                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  No contests match &quot;{search}&quot;. Try a different search
                  term or create a new contest.
                </p>
              ) : (
                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  Get started by creating your first contest.
                </p>
              )}
              <Button asChild variant="outline" className="mt-2">
                <Link href="/admin/contests/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Contest
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[240px]">
                        Contest Details
                      </TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Teams</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contests.map((contest) => (
                      <TableRow key={contest.id}>
                        <TableCell>
                          <div className="space-y-1.5">
                            <div className="font-medium text-base">
                              {contest.name}
                            </div>
                            {contest.location && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 mr-1" />
                                <span className="truncate max-w-[220px]">
                                  {contest.location}
                                </span>
                              </div>
                            )}
                            {/* Gallery link */}
                            {contest.gallery && (
                              <div className="flex items-center text-sm">
                                <Link
                                  href={`/galleries/${contest.gallery.slug}`}
                                  target="_blank"
                                  className="text-blue-500 hover:text-blue-700 flex items-center"
                                >
                                  <Images className="h-3.5 w-3.5 mr-1" />
                                  <span>{contest.gallery.title}</span>
                                </Link>
                              </div>
                            )}
                            {contest.standingsUrl && (
                              <div className="flex items-center text-sm">
                                <Link
                                  href={contest.standingsUrl}
                                  target="_blank"
                                  className="text-blue-500 hover:text-blue-700 flex items-center"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                  <span>Standings</span>
                                </Link>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getContestTypeBadge(contest.contestType)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span>
                              {contest.date
                                ? format(new Date(contest.date), "PP")
                                : "No date set"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Trophy className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span className="text-sm">
                              {contest._count.teams} team
                              {contest._count.teams !== 1 ? "s" : ""}
                            </span>
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
                                href={`/admin/contests/${contest.id}/edit`}
                                className="flex items-center justify-center"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <DeleteContestButton
                              id={contest.id}
                              name={contest.name}
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
