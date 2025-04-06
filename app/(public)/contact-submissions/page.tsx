import { Metadata } from "next";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { getContactSubmissions, isAdmin } from "./actions";
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
import { DeleteButton } from "./components/delete-button";
import { DeleteAllButton } from "./components/delete-all-button";
import { MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Submissions - Admin Dashboard",
  description: "View and manage contact form submissions",
};

export default async function ContactSubmissionsPage() {
  // Check if user is admin
  const userIsAdmin = await isAdmin();

  if (!userIsAdmin) {
    redirect("/"); // Redirect non-admin users to homepage
  }

  // Fetch contact submissions
  const { success, data: submissions } = await getContactSubmissions();

  if (!success || !submissions) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Error
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              Failed to load contact submissions
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                <MessageSquare className="mr-2 h-6 w-6 text-blue-600 dark:text-blue-400" />
                Contact Form Submissions
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300 mt-1">
                View and manage all user contact form submissions
              </CardDescription>
            </div>
            {submissions.length > 0 && <DeleteAllButton />}
          </div>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                <MessageSquare className="h-8 w-8 text-slate-500 dark:text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No contact submissions found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Contact form submissions will appear here when users submit the
                form
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 dark:border-slate-700">
                    <TableHead className="w-[120px] text-slate-700 dark:text-slate-300">
                      Date
                    </TableHead>
                    <TableHead className="w-[180px] text-slate-700 dark:text-slate-300">
                      Name
                    </TableHead>
                    <TableHead className="w-[200px] text-slate-700 dark:text-slate-300">
                      Email
                    </TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">
                      Message
                    </TableHead>
                    <TableHead className="w-[100px] text-right text-slate-700 dark:text-slate-300">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow
                      key={submission.id}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <TableCell className="font-medium text-slate-900 dark:text-slate-200">
                        <span className="whitespace-nowrap">
                          {formatDistanceToNow(new Date(submission.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">
                        {submission.name}
                      </TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${submission.email}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {submission.email}
                        </a>
                      </TableCell>
                      <TableCell className="max-w-xs text-slate-700 dark:text-slate-300">
                        <div className="truncate">{submission.message}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteButton id={submission.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
