import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getRanklistUsers } from "./actions";
import { UserList } from "./components/users-list";
import { getTracker } from "@/app/admin/trackers/actions";
import { getRanklist } from "../../actions";

interface PageProps {
  params: Promise<{
    id: string;
    ranklistId: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const awaitedParams = await params;
  const { id: trackerId, ranklistId } = awaitedParams;

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
    title: `Users - ${ranklist.keyword} | ${tracker.title} | DIU ACM Admin`,
    description: `Manage users for ${ranklist.keyword} ranklist in ${tracker.title}`,
  };
}

export default async function Page({ params }: PageProps) {
  const awaitedParams = await params;

  const { id: trackerId, ranklistId } = awaitedParams;

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
                <Link href={`/admin/trackers/${trackerId}`}>
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
                  href={`/admin/trackers/${trackerId}/ranklists/${ranklistId}`}
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
            Manage users for the {ranklist.keyword} ranklist
          </p>
        </div>
      </div>

      <UserList ranklistId={ranklistId} initialUsers={users} />
    </div>
  );
}
