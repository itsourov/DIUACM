"use client";

import Link from "next/link";
import Image from "next/image";
import { User, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Programmer = {
  id: string;
  name: string;
  username: string;
  image: string | null;
  department: string | null;
  studentId: string | null;
  gender: string | null;
  codeforcesHandle: string | null;
  maxCfRating: number | null;
};

interface ProgrammerRowProps {
  programmer: Programmer;
}

export function ProgrammerRow({ programmer }: ProgrammerRowProps) {
  // Function to determine rating category and colors
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
    <div className="group relative bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/40 to-slate-50/40 dark:from-slate-800/40 dark:to-slate-900/40 opacity-50 -z-10"></div>

      <Link
        href={`/programmers/${programmer.username}`}
        className="block p-4 sm:p-6 relative z-10"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
            {programmer.image ? (
              <Image
                src={programmer.image}
                alt={programmer.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <User className="h-10 w-10 text-slate-400 dark:text-slate-500" />
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {programmer.name}
            </h3>

            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                @{programmer.username}
              </Badge>

              {programmer.department && (
                <Badge variant="outline" className="text-xs">
                  {programmer.department}
                </Badge>
              )}

              {programmer.gender && (
                <Badge variant="outline" className="text-xs capitalize">
                  {programmer.gender.toLowerCase()}
                </Badge>
              )}
            </div>

            {/* Competitive Programming Info */}
            {programmer.codeforcesHandle && (
              <div className="mt-3 flex items-center justify-center sm:justify-start">
                <Code className="h-4 w-4 mr-1 text-slate-500 dark:text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-300 mr-1">
                  CF:
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  {programmer.codeforcesHandle}
                </span>

                {programmer.maxCfRating && ratingCategory && (
                  <span className={`text-sm ml-2 ${ratingCategory.color}`}>
                    ({programmer.maxCfRating})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Arrow indicator for clickable card */}
          <div className="absolute bottom-4 right-4 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 text-blue-700 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  );
}
