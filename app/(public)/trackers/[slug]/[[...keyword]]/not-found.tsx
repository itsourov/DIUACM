import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrackerNotFound() {
  return (
    <div className="container mx-auto px-4 flex flex-col items-center justify-center py-24 text-center">
      {/* 404 Visual */}
      <div className="relative mb-8">
        <div className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
          404
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10 opacity-10">
          <Search className="h-48 w-48 text-slate-900 dark:text-white" />
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
        Tracker Not Found
      </h1>

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
