import Link from "next/link";
import {  ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface RankListNotFoundProps {
  trackerSlug: string;
  trackerName?: string;
  requestedKeyword: string;
  availableRankLists: string[];
}

export function RankListNotFound({
  trackerSlug,
  trackerName,
  requestedKeyword,
  availableRankLists,
}: RankListNotFoundProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header section */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Rank List{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
            Not Found
          </span>
        </h1>

        <div className="mx-auto w-20 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mb-6"></div>

        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-2">
          The rank list &quot;
          <span className="font-medium">{requestedKeyword}</span>&quot; was not
          found{" "}
          {trackerName && (
            <>
              for the tracker &quot;
              <span className="font-medium">{trackerName}</span>&quot;
            </>
          )}
          .
        </p>
      </div>

      {/* Available Rank Lists */}
      <div className="max-w-2xl mx-auto">
        {availableRankLists.length > 0 ? (
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-slate-500 dark:text-slate-400" />
                Available Rank Lists
              </h3>

              <div className="grid gap-3">
                {availableRankLists.map((keyword) => (
                  <Button
                    key={keyword}
                    asChild
                    variant="outline"
                    className="justify-start h-auto p-4 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  >
                    <Link href={`/trackers/${trackerSlug}/${keyword}`}>
                      <span className="font-medium">{keyword}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                <BarChart3 className="h-6 w-6 text-slate-500 dark:text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                No rank lists available for this tracker.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Button
            asChild
            size="lg"
            className="rounded-full px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-xl transition-all dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600"
          >
            <Link href={`/trackers/${trackerSlug}`}>
              View Default Rank List
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all"
          >
            <Link href="/trackers" className="inline-flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trackers
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
