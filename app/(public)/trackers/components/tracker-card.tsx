import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { PublicTracker } from "../actions";

interface TrackerCardProps {
  tracker: PublicTracker;
}

export function TrackerCard({ tracker }: TrackerCardProps) {
  return (
    <Link href={`/trackers/${tracker.slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              {tracker.title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tracker.description && (
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {tracker.description}
              </p>
            )}
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {tracker._count.rankLists} rank list
              {tracker._count.rankLists !== 1 ? "s" : ""}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
