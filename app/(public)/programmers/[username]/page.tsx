import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { Metadata } from "next";
import {
  User,
  Calendar,
  Code,
  Mail,
  Phone,
  Medal,
  BookOpen,
  FileText,
} from "lucide-react";
import { getProgrammerByUsername } from "../actions";
import { Badge } from "@/components/ui/badge";

interface ProgrammerPageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProgrammerPageProps): Promise<Metadata> {
    const { username } = await params;
  const programmer = await getProgrammerByUsername(username);

  if (!programmer) {
    return {
      title: "Programmer Not Found - DIU ACM",
      description: "The requested programmer could not be found",
    };
  }

  return {
    title: `${programmer.name} - DIU ACM Programmer Profile`,
    description: `View the programmer profile of ${programmer.name}, a member of the DIU ACM community`,
  };
}

export default async function ProgrammerDetailsPage({
  params,
}: ProgrammerPageProps) {
    const { username } = await params;
  const programmer = await getProgrammerByUsername(username);

  if (!programmer) {
    notFound();
  }

  // Function to determine rating category
  const getRatingCategory = (rating: number | null) => {
    if (!rating) return null;

    if (rating >= 2400) return { name: "Grandmaster", color: "text-red-600" };
    if (rating >= 2200)
      return { name: "International Master", color: "text-orange-600" };
    if (rating >= 1900) return { name: "Master", color: "text-orange-500" };
    if (rating >= 1600) return { name: "Expert", color: "text-blue-600" };
    if (rating >= 1400) return { name: "Specialist", color: "text-cyan-600" };
    if (rating >= 1200) return { name: "Pupil", color: "text-green-600" };
    return { name: "Newbie", color: "text-gray-600" };
  };

  const ratingCategory = programmer.maxCfRating
    ? getRatingCategory(programmer.maxCfRating)
    : null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-md">
              {programmer.image ? (
                <Image
                  src={programmer.image}
                  alt={programmer.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="h-full w-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <User className="h-16 w-16 text-slate-400 dark:text-slate-500" />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {programmer.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  @{programmer.username}
                </Badge>

                {programmer.department && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {programmer.department}
                  </Badge>
                )}

                {programmer.gender && (
                  <Badge
                    variant="outline"
                    className="text-sm px-3 py-1 capitalize"
                  >
                    {programmer.gender.toLowerCase()}
                  </Badge>
                )}
              </div>

              {ratingCategory && programmer.codeforcesHandle && (
                <div className="mb-4">
                  <span
                    className={`text-lg font-semibold ${ratingCategory.color}`}
                  >
                    {ratingCategory.name} ({programmer.maxCfRating})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact & Personal Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <User className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                Personal Information
              </h2>

              <div className="space-y-4">
                {programmer.email && (
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-slate-500 dark:text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Email
                      </p>
                      <p className="text-slate-900 dark:text-white">
                        {programmer.email}
                      </p>
                    </div>
                  </div>
                )}

                {programmer.phone && (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-slate-500 dark:text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Phone
                      </p>
                      <p className="text-slate-900 dark:text-white">
                        {programmer.phone}
                      </p>
                    </div>
                  </div>
                )}

                {programmer.studentId && (
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-slate-500 dark:text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Student ID
                      </p>
                      <p className="text-slate-900 dark:text-white">
                        {programmer.studentId}
                      </p>
                    </div>
                  </div>
                )}

                {programmer.startingSemester && (
                  <div className="flex items-start">
                    <BookOpen className="h-5 w-5 text-slate-500 dark:text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Starting Semester
                      </p>
                      <p className="text-slate-900 dark:text-white">
                        {programmer.startingSemester}
                      </p>
                    </div>
                  </div>
                )}

                {programmer.createdAt && (
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-slate-500 dark:text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Member Since
                      </p>
                      <p className="text-slate-900 dark:text-white">
                        {format(new Date(programmer.createdAt), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Competitive Programming Profiles */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <Code className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                Competitive Programming
              </h2>

              <div className="space-y-4">
                {programmer.codeforcesHandle ? (
                  <div className="flex items-start">
                    <div className="w-8 h-8 flex items-center justify-center bg-red-100 dark:bg-red-900/20 rounded-full mr-3">
                      <span className="text-red-600 dark:text-red-400 font-bold text-sm">
                        CF
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Codeforces
                      </p>
                      <div className="flex items-center">
                        <a
                          href={`https://codeforces.com/profile/${programmer.codeforcesHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {programmer.codeforcesHandle}
                        </a>

                        {programmer.maxCfRating && (
                          <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                            (Max Rating:{" "}
                            <span
                              className={
                                ratingCategory ? ratingCategory.color : ""
                              }
                            >
                              {programmer.maxCfRating}
                            </span>
                            )
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start text-slate-500 dark:text-slate-400">
                    <div className="w-8 h-8 flex items-center justify-center bg-red-100 dark:bg-red-900/20 rounded-full mr-3">
                      <span className="text-red-600 dark:text-red-400 font-bold text-sm">
                        CF
                      </span>
                    </div>
                    <div>
                      <p className="text-sm">Codeforces</p>
                      <p>No handle provided</p>
                    </div>
                  </div>
                )}

                {programmer.atcoderHandle ? (
                  <div className="flex items-start">
                    <div className="w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900/20 rounded-full mr-3">
                      <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                        AC
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        AtCoder
                      </p>
                      <a
                        href={`https://atcoder.jp/users/${programmer.atcoderHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {programmer.atcoderHandle}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start text-slate-500 dark:text-slate-400">
                    <div className="w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900/20 rounded-full mr-3">
                      <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                        AC
                      </span>
                    </div>
                    <div>
                      <p className="text-sm">AtCoder</p>
                      <p>No handle provided</p>
                    </div>
                  </div>
                )}

                {programmer.vjudgeHandle ? (
                  <div className="flex items-start">
                    <div className="w-8 h-8 flex items-center justify-center bg-purple-100 dark:bg-purple-900/20 rounded-full mr-3">
                      <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">
                        VJ
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Vjudge
                      </p>
                      <a
                        href={`https://vjudge.net/user/${programmer.vjudgeHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {programmer.vjudgeHandle}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start text-slate-500 dark:text-slate-400">
                    <div className="w-8 h-8 flex items-center justify-center bg-purple-100 dark:bg-purple-900/20 rounded-full mr-3">
                      <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">
                        VJ
                      </span>
                    </div>
                    <div>
                      <p className="text-sm">Vjudge</p>
                      <p>No handle provided</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Events Participation */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <Medal className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                Activity Summary
              </h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/20 rounded-full mr-4">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                      {programmer._count.eventAttendances}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {programmer._count.eventAttendances === 1
                        ? "Event Attended"
                        : "Events Attended"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}