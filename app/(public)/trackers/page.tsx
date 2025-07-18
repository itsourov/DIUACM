import { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { getPublicTrackers } from "./actions";
import { TrackerCard } from "./components/tracker-card";

export const metadata: Metadata = {
  title: "Contest Trackers",
  description:
    "Track programming contest rankings and performance metrics for DIU ACM community members",
};

export default async function TrackersPage() {
  // Get all trackers without pagination
  const trackers = await getPublicTrackers();

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Contest{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
            Trackers
          </span>
        </h1>
        <div className="mx-auto w-20 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mb-6"></div>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Track contest performance and programming rankings for DIU ACM
          community members
        </p>
      </div>

      {/* Trackers Grid */}
      {trackers.length > 0 ? (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trackers.map((tracker) => (
              <TrackerCard key={tracker.id} tracker={tracker} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-8 md:p-16 text-center transition-all duration-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
            <BarChart3 className="h-8 w-8 text-slate-500 dark:text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No trackers found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            There are no contest trackers available yet. Check back soon for
            ranking updates!
          </p>
        </div>
      )}
    </div>
  );
}
