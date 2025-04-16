import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrackerBySlug, getRankListByKeyword } from "../actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Grid, TrendingUp, ScrollText } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

// Helper function to truncate text
function truncateText(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return text.substring(0, limit) + "…";
}

// Fetch all solve stats for a ranklist
async function getRanklistSolveStats(rankListId: string) {
  // Get all events in this ranklist
  const rankList = await prisma.rankList.findUnique({
    where: { id: rankListId },
    include: {
      eventRankLists: {
        include: {
          event: true,
        },
        orderBy: {
          event: {
            startingAt: "asc",
          },
        },
      },
    },
  });

  if (!rankList) return null;

  // Get all users in this ranklist
  const rankListUsers = await prisma.rankListUser.findMany({
    where: { rankListId },
    orderBy: { score: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
    },
  });

  // Get all events in this ranklist
  const eventIds = rankList.eventRankLists.map((erl) => erl.eventId);

  // Fetch all solve stats for these events
  const solveStats = await prisma.userSolveStatOnEvent.findMany({
    where: {
      eventId: { in: eventIds },
      userId: { in: rankListUsers.map((rlu) => rlu.userId) },
    },
  });

  return {
    rankList,
    users: rankListUsers,
    events: rankList.eventRankLists,
    solveStats,
  };
}

export default async function TrackerRanklistGridPage({
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

  // Get all solve stats for this ranklist
  const stats = await getRanklistSolveStats(rankList.id);

  if (!stats) {
    notFound();
  }

  // Prepare the grid data
  const { users, events, solveStats } = stats;

  // Create a lookup for solve stats
  const statLookup = new Map();
  solveStats.forEach((stat) => {
    const key = `${stat.userId}-${stat.eventId}`;
    statLookup.set(key, stat);
  });

  // Check if current user is logged in
  const session = await auth();
  const currentUserId = session?.user?.id;

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

      {/* View toggle and ranklist selector */}
      <div className="mb-8 bg-slate-50 dark:bg-slate-800/30 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Available Ranklists
          </h2>

          <Button variant="outline" size="sm" asChild>
            <Link
              href={`/trackers/${slug}${keyword ? `?keyword=${keyword}` : ""}`}
              className="flex items-center"
            >
              <ScrollText className="w-4 h-4 mr-2" />
              Ranklist View
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          {tracker.rankLists.map((list) => (
            <Link
              key={list.id}
              href={`/trackers/${slug}/grid?keyword=${list.keyword}`}
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

      {/* Grid view of ranklist */}
      <div className="rounded-lg overflow-hidden shadow-md border border-slate-200 dark:border-slate-700">
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                <Grid className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600 dark:text-blue-400" />
                {rankList.keyword} Grid View
              </h2>
              {rankList.description && (
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl">
                  {rankList.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Simplified legend */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
            <div className="flex items-center">
              <span className="text-blue-700 dark:text-blue-400 font-medium">
                X
              </span>
              <span className="text-slate-600 dark:text-slate-400">+Y</span>
              <span className="ml-1">= Solves + Upsolves in each event</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto bg-white dark:bg-slate-900">
          {events.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400">
                No events found in this ranklist.
              </p>
            </div>
          ) : (
            <div className="overflow-auto max-w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <TableHead className="min-w-[40px] w-12 sticky left-0 z-20 bg-slate-100 dark:bg-slate-800/50 font-bold text-slate-700 dark:text-slate-300 text-center">
                      #
                    </TableHead>
                    <TableHead className="min-w-[140px] sticky left-[40px] z-20 bg-slate-100 dark:bg-slate-800/50 font-bold text-slate-700 dark:text-slate-300">
                      User
                    </TableHead>
                    <TableHead className="min-w-[60px] font-bold text-slate-700 dark:text-slate-300 text-right">
                      Score
                    </TableHead>
                    <TableHead className="min-w-[60px] font-bold text-slate-700 dark:text-slate-300 text-right">
                      Total
                    </TableHead>
                    {events.map((event) => (
                      <TableHead
                        key={event.id}
                        className="font-bold text-slate-700 dark:text-slate-300 text-center min-w-[70px]"
                      >
                        <div
                          className="font-medium text-xs sm:text-sm whitespace-nowrap"
                          title={event.event.title}
                        >
                          {truncateText(event.event.title, 12)}
                        </div>
                        <div className="text-xs mt-1 opacity-75">
                          {new Date(event.event.startingAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((entry, index) => {
                    // Calculate total scores for the user
                    let totalSolves = 0;
                    let totalUpsolves = 0;

                    events.forEach((event) => {
                      const key = `${entry.userId}-${event.eventId}`;
                      const stat = statLookup.get(key);
                      if (stat) {
                        totalSolves += stat.solveCount;
                        totalUpsolves += stat.upsolveCount;
                      }
                    });

                    return (
                      <TableRow
                        key={entry.id}
                        className={`hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                          entry.user.id === currentUserId
                            ? "bg-blue-50 dark:bg-blue-950/20"
                            : ""
                        }`}
                      >
                        <TableCell className="sticky left-0 z-20 bg-white dark:bg-slate-900 text-center font-medium min-w-[40px] w-12">
                          {index < 3 ? (
                            <div
                              className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-sm ${
                                index === 0
                                  ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                                  : index === 1
                                  ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                  : "bg-amber-50/50 text-amber-700 dark:bg-amber-900/10 dark:text-amber-500"
                              }`}
                            >
                              {index + 1}
                            </div>
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </TableCell>
                        <TableCell className="sticky left-[40px] z-20 bg-white dark:bg-slate-900 min-w-[140px]">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border border-slate-200 dark:border-slate-700">
                              <AvatarImage
                                src={entry.user.image || ""}
                                alt={entry.user.name}
                              />
                              <AvatarFallback className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs sm:text-sm">
                                {entry.user.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div
                                className="font-semibold text-slate-800 dark:text-slate-200 text-sm"
                                title={entry.user.name}
                              >
                                {truncateText(entry.user.name, 15)}
                                {entry.user.id === currentUserId && (
                                  <span className="ml-1 px-1 py-0.5 text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                                    You
                                  </span>
                                )}
                              </div>
                              <div
                                className="text-xs text-slate-500 dark:text-slate-400"
                                title={`@${entry.user.username}`}
                              >
                                @{truncateText(entry.user.username, 12)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right min-w-[60px]">
                          <div className="font-semibold text-slate-800 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md inline-block">
                            {entry.score.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right min-w-[60px]">
                          <div className="font-semibold whitespace-nowrap">
                            <span className="text-blue-700 dark:text-blue-400 font-bold">
                              {totalSolves}
                            </span>
                            {totalUpsolves > 0 && (
                              <span className="text-slate-600 dark:text-slate-400">
                                +{totalUpsolves}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        {events.map((event) => {
                          const key = `${entry.userId}-${event.eventId}`;
                          const stat = statLookup.get(key);
                          const solveCount = stat?.solveCount || 0;
                          const upsolveCount = stat?.upsolveCount || 0;
                          const total = solveCount + upsolveCount;

                          return (
                            <TableCell
                              key={event.id}
                              className="text-center p-2 sm:p-4"
                            >
                              {total > 0 ? (
                                <div className="font-medium whitespace-nowrap">
                                  <span
                                    className={`text-blue-700 dark:text-blue-400 ${
                                      solveCount > 0 ? "font-bold" : ""
                                    }`}
                                  >
                                    {solveCount > 0 ? solveCount : ""}
                                  </span>
                                  {upsolveCount > 0 && (
                                    <span className="text-slate-600 dark:text-slate-400">
                                      {solveCount > 0 ? "+" : ""}
                                      {upsolveCount}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-600">
                                  —
                                </span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}

                  {users.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4 + events.length}
                        className="text-center py-12"
                      >
                        <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 py-8 bg-slate-50 dark:bg-slate-800/20 rounded-lg mx-4">
                          <FileText className="w-10 h-10 mb-3 text-slate-400" />
                          <p className="font-bold text-lg text-slate-700 dark:text-slate-300">
                            No users in this ranklist yet
                          </p>
                          <p className="text-sm mt-2 max-w-md">
                            Return to the ranklist view to join
                          </p>
                          <div className="mt-4">
                            <Button asChild variant="outline">
                              <Link
                                href={`/trackers/${slug}${
                                  keyword ? `?keyword=${keyword}` : ""
                                }`}
                              >
                                Go to Ranklist View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Mobile friendly swipe indicator */}
      {events.length > 3 && (
        <div className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400 md:hidden">
          <p>← Swipe horizontally to see all events →</p>
        </div>
      )}
    </div>
  );
}
