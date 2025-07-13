import Link from "next/link";
import { Button } from "../components/ui/button";
import { FileQuestion } from "lucide-react";
import React from "react";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 flex flex-col items-center justify-center py-24 text-center">
      {/* 404 Visual */}
      <div className="relative mb-8">
        <div className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
          404
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10 opacity-10">
          <FileQuestion className="h-48 w-48 text-slate-900 dark:text-white" />
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
        Page Not Found
      </h1>

      <p className="text-lg text-slate-600 dark:text-slate-300 max-w-md mb-8">
        Oops! We couldn&apos;t find the page you&apos;re looking for. It might
        have been moved or doesn&apos;t exist.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          asChild
          size="lg"
          className="rounded-full px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-xl transition-all dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600"
        >
          <Link href="/">Go Home</Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-full px-8 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all"
        >
          <Link href="/questions">Browse Questions</Link>
        </Button>
      </div>
    </div>
  );
}
