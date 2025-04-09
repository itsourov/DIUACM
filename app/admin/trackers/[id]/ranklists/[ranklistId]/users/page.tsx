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
import { getTracker } from "../../../../actions";
import { getRanklist } from "../../actions";
import { getRanklistUsers } from "./actions";
import { UsersList } from "./components/users-list";

interface RanklistUsersPageProps {
  params: {
    id: string;
    ranklistId: string;
  };
}

export async function generateMetadata({
  params,
}: RanklistUsersPageProps): Promise<Metadata> {
  const trackerId = params.id;
  const ranklistId = params.ranklistId;

  const [trackerResponse, ranklistResponse] = await Promise.all([
    getTracker(trackerId),
    getRanklist(ranklistId),
  ]);

  const tracker = trackerResponse.data;
  const ranklist = ranklistResponse.data;

  if (!tracker || !ranklist) {
    return {
      title: "Not Found",
      description: "The requested resource could not be found",
    };
  }

  return {
    title: `Ranklist Users - ${ranklist.keyword} | DIU ACM Admin`,
    description: `Manage users for ranklist ${ranklist.keyword}`,
  };
}

export default async function RanklistUsersPage({
  params,
}: RanklistUsersPageProps) {
  const trackerId = params.id;
  const ranklistId = params.ranklistId;

  const [trackerResponse, ranklistResponse, usersResponse] = await Promise.all([
    getTracker(trackerId),
    getRanklist(ranklistId),
    getRanklistUsers(ranklistId),
  ]);

  const tracker = trackerResponse.data;
  const ranklist = ranklistResponse.data;
  const users = usersResponse.data || [];

  if (!tracker || !ranklist) {
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
                <Link href="/admin/trackers">Trackers</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/admin/trackers/${trackerId}/edit`}>
                  {tracker.title}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/admin/trackers/${trackerId}/ranklists`}>
                  Ranklists
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/admin/trackers/${trackerId}/ranklists/${ranklistId}/edit`}
                >
                  {ranklist.keyword}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-foreground font-medium">
                Users
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ranklist Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage users for ranklist &quot;{ranklist.keyword}&quot; in tracker
            &quot;
            {tracker.title}&quot;
          </p>
        </div>
      </div>
      <UsersList ranklistId={ranklistId} initialUsers={users} />
    </div>
  );
}
