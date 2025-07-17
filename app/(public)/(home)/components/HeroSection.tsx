import { ArrowRight, Code2, Trophy, Terminal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LocalTime from "./local-time";

const HeroSection = () => {
  const currentUser = "diuacm";

  return (
    <section className="relative overflow-hidden py-16 md:py-28">
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

          {/* Right Side - Enhanced Code Editor with improved styling */}
          <div className="hidden md:block flex-1 min-w-0 relative group">
            {/* Ambient light effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 rounded-2xl blur-2xl opacity-25 dark:opacity-40 group-hover:opacity-30 dark:group-hover:opacity-50 transition-opacity duration-500"></div>

            {/* Animated corner accents */}
            <div className="absolute -top-2 -left-2 w-16 h-16 bg-blue-500/20 dark:bg-blue-400/20 rounded-full blur-xl animate-pulse duration-5000"></div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-purple-500/20 dark:bg-purple-400/20 rounded-full blur-xl animate-pulse duration-7000"></div>

            {/* Code editor with improved glass effect */}
            <div className="relative rounded-xl overflow-hidden shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
              {/* Editor top bar */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/70 transition-colors duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-inner" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-inner" />
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-inner" />
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <Code2 className="w-4 h-4" />
                  main.cpp
                </div>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                  <span>Ready</span>
                </div>
              </div>

              {/* Code content with improved syntax highlighting */}
              <div className="p-4 sm:p-5 space-y-4 overflow-x-auto text-slate-800 dark:text-slate-200 bg-slate-50/70 dark:bg-slate-900/80 transition-colors duration-300">
                <pre className="text-xs sm:text-sm font-mono leading-6 font-medium">
                  <code>
                    <span className="text-blue-600 dark:text-blue-400">{`#include `}</span>
                    <span className="text-slate-500 dark:text-slate-400">{`<`}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{`bits/stdc++.h`}</span>
                    <span className="text-slate-500 dark:text-slate-400">{`>`}</span>
                    {`
`}
                    <span className="text-purple-600 dark:text-purple-400">{`using namespace `}</span>
                    <span className="text-blue-600 dark:text-blue-400">{`std`}</span>
                    <span className="text-slate-600 dark:text-slate-300">{`;`}</span>
                    {`
`}
                    <span className="text-pink-600 dark:text-pink-400">{`#define `}</span>
                    <span className="text-cyan-600 dark:text-cyan-400">{`ll `}</span>
                    <span className="text-blue-600 dark:text-blue-400">{`long long`}</span>
                    {`
`}
                    {`
`}
                    <span className="text-blue-600 dark:text-blue-400">{`int`}</span>
                    <span className="text-slate-600 dark:text-slate-300">{` `}</span>
                    <span className="text-yellow-600 dark:text-yellow-400">{`main`}</span>
                    <span className="text-slate-600 dark:text-slate-300">{`() {`}</span>
                    {`
    `}
                    <span className="text-blue-600 dark:text-blue-400">{`ios_base`}</span>
                    <span className="text-slate-600 dark:text-slate-300">{`::`}</span>
                    <span className="text-yellow-600 dark:text-yellow-400">{`sync_with_stdio`}</span>
                    <span className="text-slate-600 dark:text-slate-300">{`(`}</span>
                    <span className="text-orange-600 dark:text-orange-400">{`false`}</span>
                    <span className="text-slate-600 dark:text-slate-300">{`);`}</span>
                    {`
    `}
                    <span className="text-blue-600 dark:text-blue-400">{`cin`}</span>
                    <span className="text-slate-600 dark:text-slate-300">{`.`}</span>
                    <span className="text-yellow-600 dark:text-yellow-400">{`tie`}</span>
                    <span className="text-slate-600 dark:text-slate-300">{`(`}</span>
                    <span className="text-orange-600 dark:text-orange-400">{`nullptr`}</span>
                    <span className="text-slate-600 dark:text-slate-300">{`);`}</span>
                    {`

    `}
                    <span className="text-blue-600 dark:text-blue-400">{`cout`}</span>
                    <span className="text-slate-600 dark:text-slate-300">{` << `}</span>
                    <span className="text-amber-600 dark:text-amber-400">{`"Welcome to DIUACM!"`}</span>
                    <span className="text-slate-600 dark:text-slate-300">{` << `}</span>
                    <span className="text-blue-600 dark:text-blue-400">{`endl`}</span>
                    <span className="text-slate-600 dark:text-slate-300">{`;`}</span>
                    {`
    
    `}
                    <span className="text-pink-600 dark:text-pink-400">{`return`}</span>
                    <span className="text-slate-600 dark:text-slate-300">{` `}</span>
                    <span className="text-orange-600 dark:text-orange-400">{`0`}</span>
                    <span className="text-slate-600 dark:text-slate-300">{`;`}</span>
                    {`
`}
                    <span className="text-slate-600 dark:text-slate-300">{`}`}</span>
                  </code>
                </pre>

                {/* Enhanced status bar */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700/50 pt-3 mt-2 transition-colors duration-300">
                  <div className="flex items-center gap-2 font-mono">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>@{currentUser}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-medium">
                      <LocalTime />
                    </div>
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
