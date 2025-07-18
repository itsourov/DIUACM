import Link from "next/link";
import { Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RankListWithDetails, AttendanceMap } from "../actions";

interface RankingTableProps {
  rankList: RankListWithDetails;
  attendanceMap: AttendanceMap;
}

export function RankingTable({ rankList, attendanceMap }: RankingTableProps) {
  return (
    <div className="relative">
      {/* Fade effect for horizontal scroll */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_-20px_0_12px_-10px_rgba(255,255,255,0.9)] dark:shadow-[inset_-20px_0_12px_-10px_rgba(30,41,59,0.9)] z-20 hidden md:block" />
      
      <div className="overflow-x-auto overflow-y-visible pb-1 max-h-[calc(100vh-300px)]">
        <div className="inline-block min-w-full align-middle rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            {/* Table Header */}
            <thead className="bg-slate-50 dark:bg-slate-800/80">
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-800/80 px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="sticky left-16 z-10 bg-slate-50 dark:bg-slate-800/80 px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  Points
                </th>
                {rankList.events.map((event) => (
                  <th
                    key={event.id}
                    scope="col"
                    className="px-4 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/events/${event.id}`}
                        target="_blank"
                        className="max-w-52 overflow-hidden text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 truncate"
                      >
                        {event.title}
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-normal normal-case text-slate-500 dark:text-slate-400">
                          {new Date(event.startingAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          W: {event.weight ?? 1}
                        </Badge>
                        {rankList.considerStrictAttendance &&
                          event.openForAttendance &&
                          event.strictAttendance && (
                            <Badge
                              variant="outline"
                              className="text-xs px-2 py-0.5 bg-orange-50/80 text-orange-700 border-orange-600/20 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/60"
                              title="Strict attendance enforced - users without attendance will have solves counted as upsolves"
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
                <tr key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                  {/* Rank */}
                  <td className="sticky left-0 z-10 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center text-gray-800 dark:text-neutral-200">
                      <span className="text-sm">{index + 1}</span>
                    </div>
                  </td>

                  {/* User Name */}
                  <td className="sticky left-16 z-10 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 whitespace-nowrap">
                    <Link
                      href={`/programmers/${user.username}`}
                      className="flex items-center gap-x-3"
                    >
                      <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                        <AvatarImage src={user.image || ""} alt={user.name} />
                        <AvatarFallback className="bg-gray-300 dark:bg-slate-700">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">
                        {user.name}
                      </span>
                    </Link>
                  </td>

                  {/* Score */}
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-800 dark:text-white">
                      {user.score.toFixed(1)}
                    </span>
                  </td>

                  {/* Event Scores */}
                  {rankList.events.map((event) => {
                    const solvestat = user.solveStats.find(
                      (stat) => stat.eventId === event.id
                    );

                    // Check if strict attendance is enforced for this event and ranklist
                    const strictAttendanceEnforced =
                      rankList.considerStrictAttendance &&
                      event.openForAttendance &&
                      event.strictAttendance;

                    // Check if user has attendance for this event
                    const hasAttendance =
                      !strictAttendanceEnforced ||
                      attendanceMap[`${user.id}_${event.id}`];

                    return (
                      <td key={event.id} className="px-4 py-2 whitespace-nowrap">
                        <div className="flex gap-2 w-max">
                          {!solvestat ? (
                            <Badge variant="secondary" className="text-xs">
                              No data
                            </Badge>
                          ) : !solvestat.participation ? (
                            <Badge
                              variant="outline"
                              className="text-xs bg-red-50/80 text-red-700 border-red-600/20 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/60"
                            >
                              Absent
                            </Badge>
                          ) : strictAttendanceEnforced && !hasAttendance ? (
                            <>
                              <Badge
                                variant="outline"
                                className="text-xs bg-red-50/80 text-red-700 border-red-600/20 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/60"
                              >
                                Absent
                              </Badge>
                              {(solvestat.solveCount + (solvestat.upsolveCount ?? 0)) > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {solvestat.solveCount + (solvestat.upsolveCount ?? 0)} Upsolve
                                </Badge>
                              )}
                            </>
                          ) : (
                            <>
                              <Badge
                                variant="outline"
                                className="text-xs bg-green-50/80 text-green-700 border-green-600/20 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/60"
                              >
                                {solvestat.solveCount} Solve
                              </Badge>
                              {(solvestat.upsolveCount ?? 0) > 0 && (
                                <Badge variant="secondary" className="text-xs">
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
  );
}
