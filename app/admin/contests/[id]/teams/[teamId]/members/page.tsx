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
import { getTeam } from "../../actions";
import { getTeamMembers } from "./actions";
import { MembersList } from "./components/members-list";
import { getContest } from "@/app/admin/contests/actions";

interface MembersPageProps {
  params: Promise<{
    id: string;
    teamId: string;
  }>;
}

export async function generateMetadata({
  params,
}: MembersPageProps): Promise<Metadata> {
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
    title: `Team Members - ${team.name} | DIU ACM Admin`,
    description: `Manage team members for ${team.name}`,
  };
}

export default async function MembersPage({ params }: MembersPageProps) {
  const awaitedParams = await params;
  const contestId = parseInt(awaitedParams.id);
  const teamId = parseInt(awaitedParams.teamId);

  if (isNaN(contestId) || isNaN(teamId)) {
    notFound();
  }

  const [contestResponse, teamResponse, membersResponse] = await Promise.all([
    getContest(contestId),
    getTeam(teamId),
    getTeamMembers(teamId),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contest = contestResponse.data as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const team = teamResponse.data as any;
  const members = membersResponse.data || [];

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
              <BreadcrumbLink asChild>
                <Link
                  href={`/admin/contests/${contestId}/teams/${teamId}/edit`}
                >
                  {team.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-foreground font-medium">
                Team Members
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage members for team &quot;{team.name}&quot; in contest &quot;
            {contest.name}&quot;
          </p>
        </div>
      </div>
      <MembersList teamId={teamId} initialMembers={members} />
    </div>
  );
}
