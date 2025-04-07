import { ArrowRight, Code2, Trophy, Terminal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HeroSection = () => {
  const currentTime = new Date().toLocaleTimeString();
  const currentUser = "diuacm";

  return (
    <section className="relative overflow-hidden py-16 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2  items-center justify-between gap-10">
          <div>
            <div className="mb-6 inline-flex items-center">
              <Badge className="mr-2 px-3.5 py-1.5 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                DIU ACM
              </Badge>
              <div className="h-px w-10 bg-slate-300 dark:bg-slate-700"></div>
              <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                Competitive Programming Hub
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
                Learn & Compete
              </span>{" "}
              <span className="relative whitespace-nowrap">
                in Programming
                <svg
                  aria-hidden="true"
                  viewBox="0 0 418 42"
                  className="absolute -mt-1 -ml-1 left-0 h-[0.58em] w-full fill-blue-400/40 dark:fill-blue-300/20"
                  preserveAspectRatio="none"
                >
                  <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z"></path>
                </svg>
              </span>
              <span className="block mt-2">Contests</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              Join DIU ACM to excel in competitive programming through
              structured learning paths, regular contests, and expert
              mentorship. Home of ICPC aspirants at Daffodil International
              University.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-xl transition-all dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 min-w-[200px] font-medium"
              >
                <Link href="/events">
                  <Trophy className="mr-2 h-4 w-4" />
                  Join Contests
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-8 bg-white/80 hover:bg-white text-blue-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 shadow-md hover:shadow-xl transition-all dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-blue-400 dark:hover:text-blue-300 dark:border-slate-700 dark:hover:border-slate-600 min-w-[200px] font-medium backdrop-blur-sm"
              >
                <Link href="/about">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Learn More
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Side - Code Editor with ambient effect */}
          <div className="hidden md:block flex-1 min-w-0  relative group">
            {/* Ambient light effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-blue-500/30 rounded-2xl blur-2xl opacity-20 dark:opacity-30 group-hover:opacity-25 dark:group-hover:opacity-40 transition-opacity duration-500"></div>

            {/* Animated corner accents */}
            <div className="absolute -top-2 -left-2 w-16 h-16 bg-blue-500/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl"></div>

            {/* Code editor with glass effect */}
            <div className="relative rounded-xl overflow-hidden shadow-2xl bg-slate-900/95 backdrop-blur-sm border border-slate-800/50">
              {/* Editor top bar */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                  <Code2 className="w-4 h-4" />
                  main.cpp
                </div>
              </div>

              {/* Code content */}
              <div className="p-3 sm:p-4 space-y-4 overflow-x-auto text-white">
                <pre className="text-xs sm:text-sm font-mono leading-6">
                  <code>
                    {`#include `}
                    <span className="text-slate-300">{`<`}</span>
                    <span className="text-emerald-400">{`bits/stdc++.h`}</span>
                    <span className="text-slate-300">{`>`}</span>
                    {`
using namespace std;
`}
                    <span className="text-fuchsia-400">{`#define`}</span>
                    {` ll long long
`}
                    {`
`}
                    <span className="text-sky-400">{`int`}</span>
                    <span className="text-yellow-300">{` main`}</span>
                    <span className="text-slate-300">{`() {`}</span>
                    {`
    ios_base::`}
                    <span className="text-yellow-300">{`sync_with_stdio`}</span>
                    {`(`}
                    <span className="text-amber-300">{`0`}</span>
                    {`);
    cin.`}
                    <span className="text-yellow-300">{`tie`}</span>
                    {`(`}
                    <span className="text-amber-300">{`0`}</span>
                    {`);

    cout << `}
                    <span className="text-amber-300">{`"Welcome to DIUACM Website"`}</span>
                    {` << endl;
}`}
                  </code>
                </pre>

                {/* File info */}
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="hidden sm:inline">{currentTime}</span>
                    <span className="sm:hidden">
                      {currentTime.split(":")[0]}:{currentTime.split(":")[1]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3 h-3" />@{currentUser}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
