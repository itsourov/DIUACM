import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrackerBySlug, getRankList } from "../actions";
import { UserStatsModal } from "./components/user-stats-modal";
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

export default async function TrackerRanklistPage({
  params,
}: {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}) {
  const awaitedParams = await params;
  const tracker = await getTrackerBySlug(awaitedParams.slug);

  if (!tracker) {
    notFound();
  }

  const rankList = await getRankList(awaitedParams.id);

  if (!rankList) {
    notFound();
  }

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
              href={`/trackers/${awaitedParams.slug}/${list.id}`}
              className={`px-4 py-2 text-sm rounded-md font-medium transition-all
                ${
                  awaitedParams.id === list.id
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
                  } hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
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
                        Users will appear once they participate in events. Check
                        back later!
                      </p>
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
