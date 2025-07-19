import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { ProgrammerResult } from "../actions";
import Link from "next/link";

interface ProgrammerCardProps {
  programmer: ProgrammerResult;
}

export function ProgrammerCard({ programmer }: ProgrammerCardProps) {
  const initials = programmer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const getRatingColor = (rating: number | null) => {
    if (!rating) return "bg-gray-500";
    if (rating >= 2400) return "bg-red-500";
    if (rating >= 2100) return "bg-orange-500";
    if (rating >= 1900) return "bg-purple-500";
    if (rating >= 1600) return "bg-blue-500";
    if (rating >= 1400) return "bg-cyan-500";
    if (rating >= 1200) return "bg-green-500";
    return "bg-gray-500";
  };

  const getRatingTitle = (rating: number | null) => {
    if (!rating) return "Unrated";
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
    <Link href={`/programmers/${programmer.username}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer">
        <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Avatar */}
          <Avatar className="w-16 h-16 ring-2 ring-slate-200 dark:ring-slate-700">
            <AvatarImage src={programmer.image || ""} alt={programmer.name} />
            <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          <div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {programmer.name}
            </h3>
            {programmer.studentId && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                ID: {programmer.studentId}
              </p>
            )}
          </div>

          {/* Rating Badge */}
          {programmer.maxCfRating && (
            <div className="flex flex-col items-center space-y-2">
              <Badge
                className={`${getRatingColor(programmer.maxCfRating)} text-white hover:opacity-80 transition-opacity`}
              >
                <Trophy className="w-3 h-3 mr-1" />
                {programmer.maxCfRating}
              </Badge>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {getRatingTitle(programmer.maxCfRating)}
              </p>
            </div>
          )}

        </div>
        </CardContent>
      </Card>
    </Link>
  );
}