import { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { getEvents } from "./actions";
import { EventFilters } from "./components/event-filters";
import { EventRow } from "./components/event-row";
import { CustomPagination } from "@/components/custom-pagination";

export const metadata: Metadata = {
  title: "Events - DIU ACM",
  description: "Browse and register for upcoming DIU ACM events and workshops",
};

export interface SearchParams {
  category?: string;
  scope?: string;
  page?: string;
  title?: string;
}

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function EventsPage({ searchParams }: PageProps) {
  // Await searchParams to get the actual values
  const awaitedSearchParams = await searchParams;
  // Parse pagination parameters
  const currentPage = awaitedSearchParams.page
    ? parseInt(awaitedSearchParams.page)
    : 1;

  // Get events data
  const eventsData = await getEvents({
    categoryId: awaitedSearchParams.category,
    scope: awaitedSearchParams.scope,
    page: currentPage,
    limit: 10,
    title: awaitedSearchParams.title,
  });

  // Destructure events data
  const { events, pagination } = eventsData;

  // Determine if there are active filters
  const hasActiveFilters = !!(
    awaitedSearchParams.category ||
    awaitedSearchParams.title ||
    awaitedSearchParams.scope
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">
          Events
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Discover and register for upcoming workshops, competitions, and more
        </p>
      </div>

      {/* Filters at the top */}
      <div className="mb-6">
        <EventFilters />
      </div>

      {/* Results count */}
      <div className="mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 transition-all duration-300 hover:bg-white dark:hover:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <CalendarDays className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                {pagination.total} {pagination.total === 1 ? "Event" : "Events"}
                {hasActiveFilters ? " found" : ""}
              </h2>
              {hasActiveFilters && pagination.total > 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Showing page {pagination.page} of {pagination.pages}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      {events.length > 0 ? (
        <div className="space-y-4 mb-8">
          {events.map((event) => (
            <EventRow key={event.id} event={event} />
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
            No events found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {hasActiveFilters
              ? "Try adjusting your filters or check back later for more events."
              : "There are no upcoming events scheduled at the moment. Check back soon!"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {events.length > 0 && pagination.pages > 1 && (
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
