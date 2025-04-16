import { Metadata } from "next";
import { ListChecks } from "lucide-react";
import Link from "next/link";
import { getTrackers } from "./actions";

export const metadata: Metadata = {
  title: "Trackers - DIU ACM",
  description: "Browse DIU ACM performance trackers and ranking lists",
};

export default async function TrackersPage() {
  // Get trackers data
  const trackers = await getTrackers();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">
          Trackers
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Performance trackers and ranking lists for DIU ACM community members
        </p>
      </div>

      {/* Results count */}
      <div className="mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 transition-all duration-300 hover:bg-white dark:hover:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <ListChecks className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                {trackers.length}{" "}
                {trackers.length === 1 ? "Tracker" : "Trackers"}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Trackers List */}
      {trackers.length > 0 ? (
        <div className="space-y-4 mb-8">
          {trackers.map((tracker) => (
            <div
              key={tracker.id}
              className="relative group bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all overflow-hidden hover:shadow-lg"
            >
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 opacity-50 -z-10"></div>

              {/* Decorative accent circle */}
              <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-blue-100/40 dark:bg-blue-900/20 -z-10"></div>

              <Link
                href={`/trackers/${tracker.slug}/`}
                className="block p-5 relative z-10"
              >
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                    {tracker.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
                    {tracker.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                      {tracker._count?.rankLists || 0}{" "}
                      {tracker._count?.rankLists === 1
                        ? "Ranklist"
                        : "Ranklists"}
                    </div>
                  </div>
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
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-8 md:p-16 text-center transition-all duration-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
            <ListChecks className="h-8 w-8 text-slate-500 dark:text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No trackers found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            There are no trackers available at the moment. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
