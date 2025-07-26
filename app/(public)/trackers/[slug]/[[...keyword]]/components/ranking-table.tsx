import Link from "next/link";
import { Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RankListWithDetails, AttendanceMap } from "../../../actions";

interface RankingTableProps {
  rankList: RankListWithDetails;
  attendanceMap: AttendanceMap;
}

export function RankingTable({ rankList, attendanceMap }: RankingTableProps) {
  return (
    <div className="space-y-4">
      {/* Table View for all screen sizes */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              {/* Table Header */}
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="sticky left-16 z-10 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Score
                  </th>
                  {rankList.events.map((event) => (
                    <th
                      key={event.id}
                      className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-48"
                    >
                      <div className="space-y-1">
                        <Link
                          href={`/events/${event.id}`}
                          target="_blank"
                          className="block text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 truncate"
                          title={event.title}
                        >
                          {event.title.length > 30
                            ? `${event.title.substring(0, 30)}...`
                            : event.title}
                        </Link>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(event.startingAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            W: {event.weight ?? 1}
                          </Badge>
                          {rankList.considerStrictAttendance &&
                            event.openForAttendance &&
                            event.strictAttendance && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                                title="Strict attendance enforced"
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                SA
                              </Badge>
                            )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {rankList.users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    {/* Rank */}
                    <td className="sticky left-0 z-10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                      {index + 1}
                    </td>

                    {/* User */}
                    <td className="sticky left-16 z-10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 px-4 py-3">
                      <Link
                        href={`/programmers/${user.username}`}
                        className="flex items-center gap-3 hover:opacity-80"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image || ""} alt={user.name} />
                          <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {user.name.length > 20
                            ? `${user.name.substring(0, 20)}...`
                            : user.name}
                        </span>
                      </Link>
                    </td>

                    {/* Score */}
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                      {user.score.toFixed(1)}
                    </td>

                    {/* Event Scores */}
                    {rankList.events.map((event) => {
                      const solvestat = user.solveStats.find(
                        (stat) => stat.eventId === event.id
                      );

                      const strictAttendanceEnforced =
                        rankList.considerStrictAttendance &&
                        event.openForAttendance &&
                        event.strictAttendance;

                      const hasAttendance =
                        !strictAttendanceEnforced ||
                        attendanceMap[`${user.id}_${event.id}`];

                      return (
                        <td key={event.id} className="px-4 py-3">
                          <div className="flex gap-2 flex-wrap">
                            {!solvestat ? (
                              <Badge variant="secondary" className="text-xs">
                                No data
                              </Badge>
                            ) : !solvestat.participation ? (
                              <Badge
                                variant="outline"
                                className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                              >
                                Absent
                              </Badge>
                            ) : strictAttendanceEnforced && !hasAttendance ? (
                              <>
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                >
                                  Absent
                                </Badge>
                                {solvestat.solveCount +
                                  (solvestat.upsolveCount ?? 0) >
                                  0 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {solvestat.solveCount +
                                      (solvestat.upsolveCount ?? 0)}{" "}
                                    Upsolve
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <>
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                >
                                  {solvestat.solveCount} Solve
                                </Badge>
                                {(solvestat.upsolveCount ?? 0) > 0 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {solvestat.upsolveCount ?? 0} Upsolve
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
