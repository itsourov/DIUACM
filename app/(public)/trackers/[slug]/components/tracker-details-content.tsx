"use client";

import Link from "next/link";
import { Users, TrendingUp, Download, Info, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrackerDetails,
  RankListWithDetails,
  AttendanceMap,
} from "../../actions";
import { RankingTable } from "./ranking-table";

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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
          {tracker.title}
        </h1>
        {tracker.description && (
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto lg:mx-0">
            {tracker.description}
          </p>
        )}
      </div>

      {/* Ranklist Navigation */}
      {allRankListKeywords.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Available Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allRankListKeywords.map((keyword) => {
                const isActive = keyword === (currentRankList.keyword || "");
                const href = `/trackers/${tracker.slug}${
                  keyword ? `?keyword=${encodeURIComponent(keyword)}` : ""
                }`;

                return (
                  <Link key={keyword} href={href}>
                    <Button
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className={
                        isActive ? "bg-blue-600 hover:bg-blue-700" : ""
                      }
                    >
                      {keyword || "Main"}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Ranklist Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Description */}
            <div className="flex-1">
              {currentRankList.description && (
                <p className="text-slate-600 dark:text-slate-400">
                  {currentRankList.description}
                </p>
              )}
            </div>

            {/* Stats and Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="gap-1.5">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users:</span>
                {currentRankList.userCount}
              </Badge>

              <Badge variant="secondary" className="gap-1.5">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Events:</span>
                {currentRankList.eventCount}
              </Badge>

              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a
                  href={`/api/trackers/${tracker.slug}/ranklist/${currentRankList.id}/csv`}
                  download={`${tracker.title}-${
                    currentRankList.keyword || "ranklist"
                  }.csv`}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download</span>
                  CSV
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ranking Table */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Rankings
          </h2>
        </div>

        {currentRankList.users.length === 0 ||
        currentRankList.events.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500 mb-4">
              <BarChart3 className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
              No data available
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              This ranklist doesn&apos;t have any data to display yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <RankingTable
              rankList={currentRankList}
              attendanceMap={attendanceMap}
            />

            {/* Scoring Information */}
            <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Scoring Information
                  </h4>
                  <div className="space-y-2 text-slate-600 dark:text-slate-400">
                    <p>
                      • Scores are calculated based on solve performance and
                      upsolve counts
                    </p>
                    <p>
                      • Upsolve weight:{" "}
                      <span className="font-medium text-slate-900 dark:text-white">
                        {currentRankList.weightOfUpsolve}
                      </span>
                    </p>
                    <p>• Event weights are displayed under each event title</p>
                    {currentRankList.considerStrictAttendance && (
                      <p>
                        •{" "}
                        <span className="font-medium text-orange-600 dark:text-orange-400">
                          Strict Attendance:
                        </span>{" "}
                        Events marked with &quot;SA&quot; require attendance.
                        Users without attendance will have their solves counted
                        as upsolves only.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
