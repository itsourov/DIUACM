import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrackerBySlug, getRankListByKeyword } from "./actions";
import { UserStatsModal } from "./components/user-stats-modal";
import { RanklistMembership } from "./components/ranklist-membership";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, TrendingUp } from "lucide-react";
import { auth } from "@/lib/auth";

export default async function TrackerRanklistPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ keyword?: string }>;
}) {
  const { slug } = await params;
  const { keyword } = await searchParams;

  const tracker = await getTrackerBySlug(slug);

  if (!tracker) {
    notFound();
  }
  if (!tracker.rankLists.length) {
    notFound();
  }

  // Get either the specified ranklist by keyword or the latest one
  const rankList = await getRankListByKeyword(tracker.id, keyword);

  if (!rankList) {
    notFound();
  }

  // Check if current user is logged in and is part of this ranklist
  const session = await auth();
  const isLoggedIn = !!session?.user?.id;
  const currentUserId = session?.user?.id;
  const isUserInRanklist = currentUserId
    ? rankList.rankListUsers.some((entry) => entry.user.id === currentUserId)
    : false;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tracker Header - Simpler design */}
      <div className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center mb-2">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          {tracker.title}
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl">
          {tracker.description}
        </p>
      </div>

      {/* Ranklist Navigation - Clean design */}
      <div className="mb-8 bg-slate-50 dark:bg-slate-800/30 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
        <h2 className="text-sm font-bold mb-4 text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Available Ranklists
        </h2>
        <div className="flex flex-wrap gap-3">
          {tracker.rankLists.map((list) => (
            <Link
              key={list.id}
              href={`/trackers/${slug}?keyword=${list.keyword}`}
              className={`px-4 py-2 text-sm rounded-md font-medium transition-all
                ${
                  list.keyword === (keyword || rankList.keyword)
                    ? "bg-blue-600 text-white dark:bg-blue-700 shadow-sm"
                    : "bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-600 dark:hover:text-blue-400"
                }`}
            >
              {list.keyword}
            </Link>
          ))}
        </div>
      </div>

      {/* Ranklist with clean design */}
      <div className="rounded-lg overflow-hidden shadow-md border border-slate-200 dark:border-slate-700">
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" />
                {rankList.keyword} Ranklist
              </h2>
              {rankList.description && (
                <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-3xl">
                  {rankList.description}
                </p>
              )}
            </div>

            <RanklistMembership
              rankListId={rankList.id}
              isUserInRanklist={isUserInRanklist}
              isLoggedIn={isLoggedIn}
            />
          </div>
        </div>

        <div className="overflow-x-auto bg-white dark:bg-slate-900">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <TableHead className="w-16 text-center font-bold text-slate-700 dark:text-slate-300">
                  Rank
                </TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-300">
                  User
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 dark:text-slate-300">
                  Score
                </TableHead>
                <TableHead className="w-24 text-center font-bold text-slate-700 dark:text-slate-300">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankList.rankListUsers.map((entry, index) => (
                <TableRow
                  key={entry.id}
                  className={`${
                    index % 2 === 0
                      ? "bg-slate-50 dark:bg-slate-800/30"
                      : "bg-white dark:bg-slate-900"
                  } hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    entry.user.id === currentUserId
                      ? "bg-blue-50 dark:bg-blue-950/20"
                      : ""
                  }`}
                >
                  <TableCell className="font-medium text-center">
                    {index < 3 ? (
                      <div
                        className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                          index === 0
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                            : index === 1
                            ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            : "bg-amber-50/50 text-amber-700 dark:bg-amber-900/10 dark:text-amber-500"
                        }`}
                      >
                        <span className="font-bold">{index + 1}</span>
                      </div>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                        <AvatarImage
                          src={entry.user.image || ""}
                          alt={entry.user.name}
                        />
                        <AvatarFallback className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {entry.user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {entry.user.name}
                          {entry.user.id === currentUserId && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          @{entry.user.username}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-slate-800 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">
                      {entry.score.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <UserStatsModal
                      userId={entry.user.id}
                      userName={entry.user.name}
                      rankListId={rankList.id}
                    />
                  </TableCell>
                </TableRow>
              ))}

              {rankList.rankListUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 py-8 bg-slate-50 dark:bg-slate-800/20 rounded-lg mx-4">
                      <FileText className="w-10 h-10 mb-3 text-slate-400" />
                      <p className="font-bold text-lg text-slate-700 dark:text-slate-300">
                        No users in this ranklist yet
                      </p>
                      <p className="text-sm mt-2 max-w-md">
                        Be the first to join this ranklist!
                      </p>

                      <div className="mt-4">
                        <RanklistMembership
                          rankListId={rankList.id}
                          isUserInRanklist={isUserInRanklist}
                          isLoggedIn={isLoggedIn}
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
