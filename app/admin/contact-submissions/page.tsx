import Link from "next/link";
import { FileText, Mail } from "lucide-react";
import { Metadata } from "next";
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
import { getPaginatedSubmissions, deleteSubmission } from "./actions";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { GenericDeleteButton } from "../components/generic-delete-button";
import { GenericSearch } from "../components/generic-search";

export const metadata: Metadata = {
    title: "Contact Submissions | DIU QBank Admin",
    description: "Manage contact form submissions",
};

interface ContactSubmissionsPageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
    }>;
}

export default async function ContactSubmissionsPage({
    searchParams,
}: ContactSubmissionsPageProps) {
    const awaitedSearchParams = await searchParams;
    const page = parseInt(awaitedSearchParams.page ?? "1", 10);
    const search = awaitedSearchParams.search || undefined;

    const { data } = await getPaginatedSubmissions(page, 10, search);

    const submissions = data?.submissions ?? [];
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
                                Contact Submissions
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Contact Submissions</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        View and manage contact form submissions
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div>
                        <CardTitle className="text-xl">Submissions List</CardTitle>
                        <CardDescription>
                            Total: {pagination.totalCount} submission
                            {pagination.totalCount !== 1 ? "s" : ""}
                        </CardDescription>
                    </div>
                    <GenericSearch placeholder="Search submissions..." />
                </CardHeader>
                <CardContent>
                    {submissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                            <div className="rounded-full bg-muted p-3">
                                <FileText className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">
                                No submissions found
                            </h3>
                            {search ? (
                                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                                    No submissions match your search criteria. Try a different
                                    search query.
                                </p>
                            ) : (
                                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                                    No contact form submissions yet.
                                </p>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[200px]">Name</TableHead>
                                            <TableHead className="w-[250px]">Email</TableHead>
                                            <TableHead className="hidden md:table-cell">
                                                Message
                                            </TableHead>
                                            <TableHead className="w-[150px]">Date</TableHead>
                                            <TableHead className="w-[80px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {submissions.map((submission) => (
                                            <TableRow key={submission.id}>
                                                <TableCell>
                                                    <div className="font-medium">{submission.name}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <a
                                                        href={`mailto:${submission.email}`}
                                                        className="flex items-center hover:text-blue-600 transition-colors"
                                                    >
                                                        <Mail className="h-4 w-4 mr-1" />
                                                        {submission.email}
                                                    </a>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell max-w-[400px]">
                                                    <p className="truncate">{submission.message}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">
                                                        {format(new Date(submission.createdAt), "MMM d, yyyy")}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <GenericDeleteButton
                                                            id={submission.id.toString()}
                                                            name={`submission from ${submission.name}`}
                                                            entityName="Contact Submission"
                                                            deleteAction={deleteSubmission}
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