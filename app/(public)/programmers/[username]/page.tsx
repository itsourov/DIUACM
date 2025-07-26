import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Phone,
  MapPin,
  GraduationCap,
  Target,
  Users,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import {
  getProgrammerDetails,
  type ContestParticipation,
  type TeamMemberResult,
  type TrackerPerformance,
} from "../actions";
import { CopyButton } from "../components/copy-button";

export async function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;

  try {
    const response = await getProgrammerDetails(username);

    if (!response.success || !response.data?.programmer) {
      throw new Error("Programmer not found");
    }

    const { programmer } = response.data;
    return {
      title: `${programmer.name} - Programmer Profile | DIU ACM`,
      description: `View ${programmer.name}&apos;s programming profile, contest participations, and achievements at DIU ACM`,
    };
  } catch {
    return {
      title: "Programmer Not Found | DIU ACM",
      description:
        "The programmer profile you're looking for could not be found.",
    };
  }
}

export default async function ProgrammerDetailsPage({ params }: PageProps) {
  const { username } = await params;

  const response = await getProgrammerDetails(username);

  if (!response.success || !response.data?.programmer) {
    notFound();
  }

  const { programmer, contestParticipations, trackerPerformances } =
    response.data;

  const initials = programmer.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  const getRatingColor = (rating: number | null) => {
    if (!rating || rating === -1) return "bg-gray-500";
    if (rating >= 2400) return "bg-red-500";
    if (rating >= 2100) return "bg-orange-500";
    if (rating >= 1900) return "bg-purple-500";
    if (rating >= 1600) return "bg-blue-500";
    if (rating >= 1400) return "bg-cyan-500";
    if (rating >= 1200) return "bg-green-500";
    return "bg-gray-500";
  };

  const getRatingTitle = (rating: number | null) => {
    if (!rating || rating === -1) return "Unrated";
    if (rating >= 2400) return "International Grandmaster";
    if (rating >= 2300) return "Grandmaster";
    if (rating >= 2100) return "International Master";
    if (rating >= 1900) return "Candidate Master";
    if (rating >= 1600) return "Expert";
    if (rating >= 1400) return "Specialist";
    if (rating >= 1200) return "Pupil";
    return "Newbie";
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Compact Profile Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <Avatar className="w-24 h-24 sm:w-32 sm:h-32 ring-2 ring-slate-200 dark:ring-slate-700 shrink-0">
            <AvatarImage src={programmer.image || ""} alt={programmer.name} />
            <AvatarFallback className="text-xl sm:text-2xl font-semibold bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Name and Basic Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-slate-900 dark:text-white">
              {programmer.name}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-3">
              @{programmer.username}
            </p>

            {/* Rating Badge */}
            {programmer.maxCfRating && programmer.maxCfRating > -1 && (
              <div className="mb-4">
                <Badge
                  className={`${getRatingColor(
                    programmer.maxCfRating
                  )} text-white text-sm px-3 py-1`}
                >
                  <Trophy className="w-4 h-4 mr-1" />
                  {programmer.maxCfRating} •{" "}
                  {getRatingTitle(programmer.maxCfRating)}
                </Badge>
              </div>
            )}

            {/* Quick Info */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300 mb-4">
              {programmer.studentId && (
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  <span>{programmer.studentId}</span>
                </div>
              )}
              {programmer.department && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{programmer.department}</span>
                </div>
              )}
              {programmer.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{programmer.phone}</span>
                </div>
              )}
            </div>

            {/* Platform Handles with Copy */}
            <div className="flex flex-wrap gap-2">
              {programmer.codeforcesHandle && (
                <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-1 text-sm">
                  <a
                    href={`https://codeforces.com/profile/${programmer.codeforcesHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    CF: {programmer.codeforcesHandle}
                  </a>
                  <CopyButton
                    text={programmer.codeforcesHandle}
                    platform="Codeforces"
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  />
                </div>
              )}

              {programmer.atcoderHandle && (
                <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg px-3 py-1 text-sm">
                  <a
                    href={`https://atcoder.jp/users/${programmer.atcoderHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    AC: {programmer.atcoderHandle}
                  </a>
                  <CopyButton
                    text={programmer.atcoderHandle}
                    platform="AtCoder"
                    className="text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                  />
                </div>
              )}

              {programmer.vjudgeHandle && (
                <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-1 text-sm">
                  <a
                    href={`https://vjudge.net/user/${programmer.vjudgeHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 dark:text-green-400 hover:underline"
                  >
                    VJ: {programmer.vjudgeHandle}
                  </a>
                  <CopyButton
                    text={programmer.vjudgeHandle}
                    platform="VJudge"
                    className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tracker Performance */}
      {trackerPerformances.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
            Tracker Performance ({trackerPerformances.length})
          </h2>

          <div className="space-y-6">
            {trackerPerformances.map((tracker: TrackerPerformance) => (
              <div
                key={tracker.tracker.id}
                className="relative bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-all overflow-hidden group hover:shadow-lg"
              >
                {/* Ambient light effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300 -z-10"></div>

                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 opacity-50 -z-10"></div>

                {/* Decorative accent element */}
                <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-purple-100/40 dark:bg-purple-900/20 -z-10"></div>

                <div className="p-5 relative z-10">
                  {/* Tracker Header */}
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                      {tracker.tracker.title}
                    </h3>
                  </div>

                  {/* Rank Lists */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {tracker.rankLists.map((rankList) => (
                      <Link
                        key={rankList.rankList.id}
                        href={`/trackers/${tracker.tracker.slug}/${rankList.rankList.keyword}`}
                        className="block p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 transition-colors border border-slate-200/60 dark:border-slate-600/40 backdrop-blur-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-slate-900 dark:text-white">
                            {rankList.rankList.keyword}
                          </h4>
                          <Badge
                            variant="outline"
                            className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                          >
                            #{rankList.userPosition}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>Total Users</span>
                            </div>
                            <span className="font-medium">
                              {rankList.totalUsers}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Events</span>
                            </div>
                            <span className="font-medium">
                              {rankList.eventCount}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Trophy className="w-4 h-4 text-amber-500" />
                              <span>Score</span>
                            </div>
                            <span className="font-medium text-amber-600 dark:text-amber-400">
                              {rankList.score.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contest Participations */}
      {contestParticipations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Contest Participations ({contestParticipations.length})
          </h2>

          <div className="space-y-4">
            {contestParticipations.map(
              (participation: ContestParticipation) => (
                <div
                  key={`${participation.contest.id}-${participation.team.id}`}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 sm:p-6 bg-white dark:bg-slate-800"
                >
                  {/* Contest Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                        {participation.contest.name}
                      </h3>
                      {participation.contest.date && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {format(
                            new Date(participation.contest.date),
                            "MMM d, yyyy"
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      >
                        {participation.team.name}
                      </Badge>
                      {participation.team.rank && (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                        >
                          Rank #{participation.team.rank}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Team Members */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Team Members ({participation.team.members.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {participation.team.members.map(
                        (member: TeamMemberResult) => (
                          <Link
                            key={member.id}
                            href={`/programmers/${member.user.username}`}
                            className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Avatar className="w-8 h-8 shrink-0">
                              <AvatarImage
                                src={member.user.image || ""}
                                alt={member.user.name}
                              />
                              <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                                {member.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400">
                                {member.user.name}
                              </p>
                              {member.user.studentId && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {member.user.studentId}
                                </p>
                              )}
                            </div>
                          </Link>
                        )
                      )}
                    </div>

                    {/* Solve Count */}
                    {participation.team.solveCount !== null && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {participation.team.solveCount} problems solved
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
