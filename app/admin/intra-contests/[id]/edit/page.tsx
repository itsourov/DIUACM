import { IntraContestForm } from "../../components/intra-contest-form";
import { Metadata } from "next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { getIntraContest } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Intra Contest | DIU ACM Admin",
  description: "Edit an existing intra contest",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditIntraContestPage({ params }: PageProps) {
  const awaitedParams = await params;
  const id = parseInt(awaitedParams.id, 10);
  const { data } = await getIntraContest(id);

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
                <Link href="/admin/intra-contests">Intra Contests</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-foreground font-medium">
                Edit
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Intra Contest
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Update details for this intra contest
            </p>
          </div>
        </div>
      </div>
      <IntraContestForm initialData={data ?? null} isEditing />
    </div>
  );
}
