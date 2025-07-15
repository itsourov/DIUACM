import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getContest } from "../../actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { ContestForm } from "../../components/contest-form";

interface EditContestPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Edit Contest | DIU ACM Admin",
  description: "Edit contest details",
};

export default async function EditContestPage({
  params,
}: EditContestPageProps) {
  const resolvedParams = await params;
  const contestId = parseInt(resolvedParams.id);

  if (isNaN(contestId)) {
    notFound();
  }

  const { data: contestData, error } = await getContest(contestId);

  if (error || !contestData) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contest = contestData as any;

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
                <Link href="/admin/contests">Contests</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-foreground font-medium">
                Edit Contest
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Contest: {contest.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Modify contest details and settings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/contests/${contestId}/teams`}>
                <Users className="h-4 w-4 mr-2" />
                Manage Teams
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <ContestForm initialData={contest} isEditing />
    </div>
  );
}
