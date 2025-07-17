import { Metadata } from "next";
import { Trophy } from "lucide-react";
import { getPublicContests, type PublicContestWithRelations } from "./actions";
import { Contest } from "./components/contest-item";

export const metadata: Metadata = {
  title: "Contests | DIU ACM",
  description:
    "Browse programming contests that DIU ACM teams have participated in, including ICPC regionals, IUPCs, and more.",
};

export default async function ContestsPage() {
  // Get all contests
  const contests: PublicContestWithRelations[] = await getPublicContests();

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Programming{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
            Contests
          </span>
        </h1>
        <div className="mx-auto w-20 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mb-6"></div>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Discover programming competitions DIU ACM teams have participated in,
          from ICPC regionals to local university contests
        </p>
      </div>

      {/* Contests List */}
      <div className="space-y-8 mb-12">
        {contests.length > 0 ? (
          contests.map((contest) => (
            <Contest key={contest.id} contest={contest} />
          ))
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-8 md:p-16 text-center transition-all duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
              <Trophy className="h-8 w-8 text-slate-500 dark:text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No contests found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              There are no programming contests published yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
