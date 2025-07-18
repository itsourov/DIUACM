"use client";

import Link from "next/link";
import { ArrowLeft, Users, TrendingUp, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrackerDetails, RankListWithDetails, AttendanceMap } from "../actions";
import { RankListTabs } from "./ranklist-tabs";
import { RankingTable } from "./ranking-table";
import { ScoringInfo } from "./scoring-info";
import { RankListActions } from "./ranklist-actions";
import { TrackerBreadcrumb } from "./tracker-breadcrumb";

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
      {/* Breadcrumb */}
      <TrackerBreadcrumb trackerTitle={tracker.title} />

      {/* Header Section */}
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          href="/trackers"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Trackers
        </Link>

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
              <RankListTabs
                keywords={allRankListKeywords}
                currentKeyword={currentRankList.keyword || ""}
                trackerSlug={tracker.slug}
              />
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
              <ScoringInfo
                weightOfUpsolve={currentRankList.weightOfUpsolve}
                considerStrictAttendance={
                  currentRankList.considerStrictAttendance
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
