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

      {/* Ranklist Navigation - Simplified */}
      <div className="mb-6">
        <h2 className="text-sm font-medium mb-3 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Available Ranklists
        </h2>
        <div className="flex flex-wrap gap-2">
          {tracker.rankLists.map((list) => (
            <Link
              key={list.id}
              href={`/trackers/${awaitedParams.slug}/${list.id}`}
              className={`px-3 py-1.5 text-sm border transition-colors
                ${
                  awaitedParams.id === list.id
                    ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                }`}
            >
              {list.keyword}
            </Link>
          ))}
        </div>
      </div>

      {/* Current Ranklist - Clean design */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-medium text-slate-900 dark:text-white">
            {rankList.keyword} Ranklist
          </h2>
          {rankList.description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {rankList.description}
            </p>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="w-24 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankList.rankListUsers.map((entry, index) => (
                <TableRow
                  key={entry.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/20"
                >
                  <TableCell className="font-medium text-center">
                    <span
                      className={`${index < 3 ? "font-semibold " : ""}${
                        index === 0
                          ? "text-amber-500"
                          : index === 1
                          ? "text-slate-500"
                          : index === 2
                          ? "text-amber-700"
                          : ""
                      }`}
                    >
                      {index + 1}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={entry.user.image || ""}
                          alt={entry.user.name}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                          {entry.user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{entry.user.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          @{entry.user.username}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {entry.score.toFixed(2)}
                  </TableCell>
                  <TableCell>
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
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 py-6">
                      <FileText className="w-6 h-6 mb-2 text-slate-400" />
                      <p className="font-medium">
                        No users in this ranklist yet
                      </p>
                      <p className="text-sm mt-1">
                        Users will appear once they participate in events.
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
