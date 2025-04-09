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
import { Button } from "@/components/ui/button";
import { getTeams } from "./actions";
import { getContest } from "../../actions";
import { Plus } from "lucide-react";
import { TeamsList } from "./components/teams-list";

interface TeamsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: TeamsPageProps): Promise<Metadata> {
  const awaitedParams = await params;
  const contestId = (awaitedParams.id);
  const { data: contest } = await getContest(contestId);

  if (!contest) {
    return {
      title: "Contest not found",
      description: "The requested contest could not be found",
    };
  }

  return {
    title: `Teams - ${contest.name} | DIU ACM Admin`,
    description: `Manage teams for ${contest.name}`,
  };
}

export default async function TeamsPage({ params }: TeamsPageProps) {
  const awaitedParams = await params;
  const contestId = (awaitedParams.id);

  

  const [contestResponse, teamsResponse] = await Promise.all([
    getContest(contestId),
    getTeams(contestId),
  ]);

  const contest = contestResponse.data;
  const teams = teamsResponse.data || [];

  if (!contest) {
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
              <BreadcrumbLink className="text-foreground font-medium">
                Teams
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contest Teams</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage teams for {contest.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href={`/admin/contests/${contestId}/teams/create`}>
                <Plus className="h-4 w-4 mr-2" />
                Add Team
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <TeamsList contestId={contestId} initialTeams={teams} />
    </div>
  );
}
