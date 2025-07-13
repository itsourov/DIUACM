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
import { getContest } from "../../../actions";
import { TeamForm } from "../components/team-form";

interface CreateTeamPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: CreateTeamPageProps): Promise<Metadata> {
  const awaitedParams = await params;
  const contestId = parseInt(awaitedParams.id);

  if (isNaN(contestId)) {
    return {
      title: "Not Found",
      description: "Invalid contest ID",
    };
  }

  const { data: contest } = await getContest(contestId);

  if (!contest) {
    return {
      title: "Contest not found",
      description: "The requested contest could not be found",
    };
  }

  return {
    title: `Add Team - ${contest.name} | DIU ACM Admin`,
    description: `Add a new team to ${contest.name}`,
  };
}

export default async function CreateTeamPage({ params }: CreateTeamPageProps) {
  const awaitedParams = await params;
  const contestId = parseInt(awaitedParams.id);

  if (isNaN(contestId)) {
    notFound();
  }

  const { data: contest, error } = await getContest(contestId);

  if (error || !contest) {
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
                <Link href="/admin/contests">Contests</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/admin/contests/${contestId}/edit`}>
                  {contest.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/admin/contests/${contestId}/teams`}>Teams</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-foreground font-medium">
                Add Team
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Team</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new team for {contest.name}
          </p>
        </div>
      </div>
      <TeamForm contestId={contestId} />
    </div>
  );
}
