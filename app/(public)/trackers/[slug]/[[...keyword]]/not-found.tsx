import Link from "next/link";
import { AlertTriangle, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrackerNotFound() {
  return (
    <div className="container mx-auto px-4 flex flex-col items-center justify-center py-24 text-center">
      {/* Visual Element */}
      <div className="relative mb-8">
        <div className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400">
          404
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10 opacity-10">
          <Search className="h-32 w-32 text-slate-900 dark:text-white" />
        </div>
      </div>

      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 mb-6">
        <AlertTriangle className="h-8 w-8 text-amber-500 dark:text-amber-400" />
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
        Tracker{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400">
          Not Found
        </span>
      </h1>

      <div className="mx-auto w-20 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-6"></div>

      <p className="text-lg text-slate-600 dark:text-slate-300 max-w-md mb-8">
        The tracker you&apos;re looking for doesn&apos;t exist or has been
        removed. It might have been moved or is no longer available.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          asChild
          size="lg"
          className="rounded-full px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-xl transition-all dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600"
        >
          <Link href="/trackers">Browse All Trackers</Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-full px-8 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all"
        >
          <Link href="/" className="inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
