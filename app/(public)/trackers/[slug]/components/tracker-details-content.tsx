"use client";

import Link from "next/link";
import { Users, TrendingUp, Download, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrackerDetails, RankListWithDetails, AttendanceMap } from "../actions";
import { RankingTable } from "./ranking-table";
import { RankListActions } from "./ranklist-actions";

interface TrackerDetailsContentProps {
  tracker: TrackerDetails;
  currentRankList: RankListWithDetails;
  allRankListKeywords: string[];
  attendanceMap: AttendanceMap;
}

export function TrackerDetailsContent({
  tracker,
  currentRankList,
  allRankListKeywords,
  attendanceMap,
}: TrackerDetailsContentProps) {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-6">
        {/* Title and Description */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {tracker.title}
            </h1>
            {tracker.description && (
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                {tracker.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Combined ranklist navigation and info */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* Ranklist Navigation Tabs */}
            {allRankListKeywords.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {allRankListKeywords.map((keyword) => {
                  const isActive = keyword === (currentRankList.keyword || "");
                  const href = `/trackers/${tracker.slug}${
                    keyword ? `?keyword=${encodeURIComponent(keyword)}` : ""
                  }`;

                  return (
                    <Link key={keyword} href={href}>
                      <Button
                        variant={isActive ? "default" : "secondary"}
                        size="sm"
                        className={
                          isActive
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }
                      >
                        {keyword}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Divider */}
            {currentRankList.description && allRankListKeywords.length > 1 && (
              <div className="border-t border-slate-200 dark:border-slate-700" />
            )}

            {/* Ranklist Info and Actions */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                {currentRankList.description && (
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {currentRankList.description}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Stats Badges */}
                <Badge variant="secondary" className="gap-x-1.5">
                  <Users className="h-4 w-4" />
                  {currentRankList.userCount} users
                </Badge>

                <Badge variant="secondary" className="gap-x-1.5">
                  <TrendingUp className="h-4 w-4" />
                  {currentRankList.eventCount} events
                </Badge>

                {/* Download CSV Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-x-1.5"
                  asChild
                >
                  <a
                    href={`/api/trackers/${tracker.slug}/ranklist/${currentRankList.id}/csv`}
                    download={`${tracker.title}-${
                      currentRankList.keyword || "ranklist"
                    }.csv`}
                  >
                    <Download className="h-4 w-4" />
                    Download CSV
                  </a>
                </Button>

                {/* Join/Leave Actions */}
                <RankListActions rankListId={currentRankList.id} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ranking Table */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent>
          {currentRankList.users.length === 0 ||
          currentRankList.events.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-12 h-12"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                No data available
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                This ranklist doesn&apos;t have any data to display yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <RankingTable
                rankList={currentRankList}
                attendanceMap={attendanceMap}
              />
              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <p className="font-medium">Scoring Information</p>
                    <ul className="mt-1 space-y-1 ml-4 list-disc text-slate-600 dark:text-slate-400">
                      <li>
                        Scores are calculated based on solve performance and
                        upsolve counts
                      </li>
                      <li>
                        Upsolve weight:{" "}
                        <span className="font-medium">
                          {currentRankList.weightOfUpsolve}
                        </span>
                      </li>
                      <li>
                        Event weights are displayed under each event title
                      </li>
                      {currentRankList.considerStrictAttendance && (
                        <li>
                          <span className="font-medium text-orange-600 dark:text-orange-400">
                            Strict Attendance:
                          </span>{" "}
                          Events marked with &quot;SA&quot; require attendance.
                          Users without attendance will have their solves
                          counted as upsolves only.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
