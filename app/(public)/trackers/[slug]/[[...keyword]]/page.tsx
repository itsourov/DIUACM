import { notFound } from "next/navigation";
import { getTrackerBySlug, getAllTrackerStaticParams } from "../../actions";
import { TrackerDetailsContent } from "./components/tracker-details-content";
import { RankListNotFound } from "./components/ranklist-not-found";

// Enable ISR with 2-hour revalidation
export const revalidate = 7200; // 2 hours in seconds

interface TrackerDetailsPageProps {
  params: Promise<{
    slug: string;
    keyword?: string[];
  }>;
}

// Generate static params for all tracker pages
export async function generateStaticParams() {
  try {
    const params = await getAllTrackerStaticParams();
    return params;
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function TrackerDetailsPage({
  params,
}: TrackerDetailsPageProps) {
  const { slug, keyword: keywordArray } = await params;

  // Extract the first keyword from the array, if it exists, and URL decode it
  const keyword = keywordArray?.[0]
    ? decodeURIComponent(keywordArray[0])
    : undefined;

  const result = await getTrackerBySlug(slug, keyword);

  if (!result.success) {
    if (result.error === "ranklist_not_found") {
      return (
        <RankListNotFound
          trackerSlug={slug}
          trackerName={result.tracker?.title}
          requestedKeyword={keyword || ""}
          availableRankLists={result.availableRankLists || []}
        />
      );
    } else {
      // tracker_not_found
      notFound();
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <TrackerDetailsContent
        tracker={result.tracker}
        currentRankList={result.currentRankList}
        allRankListKeywords={result.allRankListKeywords}
        attendanceMap={result.attendanceMap}
      />
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; keyword?: string[] }>;
}) {
  const { slug, keyword: keywordArray } = await params;
  const keyword = keywordArray?.[0]
    ? decodeURIComponent(keywordArray[0])
    : undefined;

  const result = await getTrackerBySlug(slug, keyword);

  if (!result.success) {
    if (result.error === "ranklist_not_found") {
      return {
        title: `Rank List Not Found | DIU ACM`,
        description: `The rank list "${keyword}" was not found for this tracker.`,
      };
    } else {
      return {
        title: "Tracker Not Found | DIU ACM",
        description: "The requested tracker could not be found.",
      };
    }
  }

  return {
    title: `${result.tracker.title} - Tracker | DIU ACM`,
    description:
      result.tracker.description ||
      `View rankings and statistics for ${result.tracker.title}`,
  };
}
