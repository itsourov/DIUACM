import { Metadata } from "next";
import { Users } from "lucide-react";
import { getProgrammers } from "./actions";
import { ProgrammerFilters } from "./components/programmer-filters";
import { ProgrammerRow } from "./components/programmer-row";
import { CustomPagination } from "@/components/custom-pagination";

export const metadata: Metadata = {
  title: "Programmers - DIU ACM",
  description: "Browse profiles of DIU ACM community programmers",
};

export interface SearchParams {
  name?: string;
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
    page: currentPage,
    limit: 12,
    name: awaitedSearchParams.name,
  });

  // Destructure programmers data
  const { programmers, pagination } = programmersData;

  // Determine if there is an active search
  const hasSearch = !!awaitedSearchParams.name;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">
          Programmers
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Browse profiles of DIU ACM community members and competitive
          programmers
        </p>
      </div>

      {/* Search at the top */}
      <div className="mb-6">
        <ProgrammerFilters />
      </div>

      {/* Results count */}
      <div className="mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 transition-all duration-300 hover:bg-white dark:hover:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <Users className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                {pagination.total}{" "}
                {pagination.total === 1 ? "Programmer" : "Programmers"}
                {hasSearch ? " found" : ""}
              </h2>
              {hasSearch && pagination.total > 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Showing page {pagination.page} of {pagination.pages}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Programmers List - Modified to display 3 per row on desktop */}
      {programmers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {programmers.map((programmer) => (
            <ProgrammerRow key={programmer.id} programmer={programmer} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-8 md:p-16 text-center transition-all duration-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-slate-500 dark:text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No programmers found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {hasSearch
              ? "Try adjusting your search criteria."
              : "There are no programmers registered in the system at the moment."}
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
