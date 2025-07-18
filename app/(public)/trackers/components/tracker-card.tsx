import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Trophy, Users, Clock, ArrowRight } from "lucide-react";
import { PublicTracker } from "../actions";

interface TrackerCardProps {
  tracker: PublicTracker;
}

export function TrackerCard({ tracker }: TrackerCardProps) {
  return (
    <Card className="group hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-slate-800 hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg lg:text-xl font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                {tracker.title}
              </CardTitle>
            </div>
            {tracker.description && (
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-2">
                {tracker.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <Trophy className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span className="truncate">
                {tracker._count.rankLists} rank list
                {tracker._count.rankLists !== 1 ? "s" : ""}
              </span>
            </div>
            {tracker.updatedAt && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">
                  Updated{" "}
                  {new Date(tracker.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Link
              href={`/trackers/${tracker.slug}`}
              className="group/btn inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            >
              <Users className="h-4 w-4 mr-2 transition-transform group-hover/btn:scale-110" />
              <span>View Rankings</span>
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
