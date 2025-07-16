import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import type { Contest } from "@/db/schema";
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
  const contestId = parseInt(awaitedParams.id);

  if (isNaN(contestId)) {
    return {
      title: "Not Found",
      description: "Invalid contest ID",
    };
  }

  const { data: contestData } = await getContest(contestId);

  if (!contestData) {
    return {
      title: "Contest not found",
      description: "The requested contest could not be found",
    };
  }

  const contest = contestData as Contest;

  return {
    title: `Teams - ${contest.name} | DIU ACM Admin`,
    description: `Manage teams for ${contest.name}`,
  };
}

export default async function TeamsPage({ params }: TeamsPageProps) {
  const awaitedParams = await params;
  const contestId = parseInt(awaitedParams.id);

  if (isNaN(contestId)) {
    notFound();
  }

  const [contestResponse, teamsResponse] = await Promise.all([
    getContest(contestId),
    getTeams(contestId),
  ]);

  const contest = contestResponse.data as Contest;
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage teams for contest &quot;{contest.name}&quot;
            </p>
          </div>
          <Button asChild>
            <Link href={`/admin/contests/${contestId}/teams/create`}>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Link>
          </Button>
        </div>
      </div>
      <TeamsList contestId={contestId} initialTeams={teams} />
    </div>
  );
}
