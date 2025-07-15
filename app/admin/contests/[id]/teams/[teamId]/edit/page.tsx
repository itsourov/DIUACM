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
import { getContest } from "../../../../actions";

import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { getTeam } from "../../actions";
import { TeamForm } from "../../components/team-form";

interface EditTeamPageProps {
  params: Promise<{
    id: string;
    teamId: string;
  }>;
}

export async function generateMetadata({
  params,
}: EditTeamPageProps): Promise<Metadata> {
  const awaitedParams = await params;
  const contestId = parseInt(awaitedParams.id);
  const teamId = parseInt(awaitedParams.teamId);

  if (isNaN(contestId) || isNaN(teamId)) {
    return {
      title: "Not Found",
      description: "Invalid contest or team ID",
    };
  }

  const [contestResponse, teamResponse] = await Promise.all([
    getContest(contestId),
    getTeam(teamId),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contest = contestResponse.data as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const team = teamResponse.data as any;

  if (!contest || !team) {
    return {
      title: "Not Found",
      description: "The requested resource could not be found",
    };
  }

  return {
    title: `Edit ${team.name} - ${contest.name} | DIU ACM Admin`,
    description: `Edit team details for ${team.name}`,
  };
}

export default async function EditTeamPage({ params }: EditTeamPageProps) {
  const awaitedParams = await params;
  const contestId = parseInt(awaitedParams.id);
  const teamId = parseInt(awaitedParams.teamId);

  if (isNaN(contestId) || isNaN(teamId)) {
    notFound();
  }

  const [contestResponse, teamResponse] = await Promise.all([
    getContest(contestId),
    getTeam(teamId),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contest = contestResponse.data as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const team = teamResponse.data as any;

  if (!contest || !team) {
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
                Edit Team
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Team: {team.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Modify team details for {contest.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link
                href={`/admin/contests/${contestId}/teams/${teamId}/members`}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Team Members
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <TeamForm contestId={contestId} team={team} />
    </div>
  );
}
