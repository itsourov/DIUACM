import { Metadata } from "next";
import { Code2 } from "lucide-react";
import { getProgrammers } from "./actions";
import { ProgrammerCard } from "./components/programmer-card";
import { SearchProgrammers } from "./components/search-programmers";
import { CustomPagination } from "@/components/custom-pagination";

export const metadata: Metadata = {
  title: "Programmers - DIU ACM",
  description: "Discover talented programmers from DIU ACM community ranked by their Codeforces ratings",
};

export interface SearchParams {
  search?: string;
  page?: string;
}

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function ProgrammersPage({ searchParams }: PageProps) {
  // Await searchParams to get the actual values
  const awaitedSearchParams = await searchParams;
  
  // Parse pagination parameters
  const currentPage = awaitedSearchParams.page
    ? parseInt(awaitedSearchParams.page)
    : 1;

  // Get programmers data
  const programmersData = await getProgrammers({
    search: awaitedSearchParams.search,
    page: currentPage,
    limit: 12,
  });

  // Destructure programmers data
  const { programmers, pagination } = programmersData;

  // Determine if there are active filters
  const hasActiveFilters = !!(awaitedSearchParams.search);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Our{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
            Programmers
          </span>
        </h1>
        <div className="mx-auto w-20 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mb-6"></div>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Discover talented programmers from DIU ACM community ranked by their Codeforces ratings
        </p>
      </div>

      {/* Search Section */}
      <div className="mb-8 flex justify-center">
        <SearchProgrammers />
      </div>


      {/* Programmers Grid */}
      {programmers.length > 0 ? (
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {programmers.map((programmer) => (
              <ProgrammerCard key={programmer.id} programmer={programmer} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-8 md:p-16 text-center transition-all duration-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
            <Code2 className="h-8 w-8 text-slate-500 dark:text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No programmers found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {hasActiveFilters
              ? "Try adjusting your search query or check back later."
              : "There are no programmers registered yet. Check back soon!"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {programmers.length > 0 && pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <CustomPagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
          />
        </div>
      )}
    </div>
  );
}