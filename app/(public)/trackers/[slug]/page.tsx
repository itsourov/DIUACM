import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTrackerBySlug } from "./actions";
import { TrackerDetailsContent } from "./components/tracker-details-content";
import { TrackerDetailsSkeleton } from "./components/tracker-details-skeleton";

interface TrackerDetailsPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    keyword?: string;
  }>;
}

export default async function TrackerDetailsPage({
  params,
  searchParams,
}: TrackerDetailsPageProps) {
  const { slug } = await params;
  const { keyword } = await searchParams;

  try {
    const data = await getTrackerBySlug(slug, keyword);
    
    return (
      <div className="container mx-auto px-4 py-12">
        <Suspense fallback={<TrackerDetailsSkeleton />}>
          <TrackerDetailsContent
            tracker={data.tracker}
            currentRankList={data.currentRankList}
            allRankListKeywords={data.allRankListKeywords}
            attendanceMap={data.attendanceMap}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error loading tracker:", error);
    notFound();
  }
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  try {
    const data = await getTrackerBySlug(slug);
    
    return {
      title: `${data.tracker.title} - Tracker | DIU ACM`,
      description: data.tracker.description || `View rankings and statistics for ${data.tracker.title}`,
    };
  } catch {
    return {
      title: "Tracker Not Found | DIU ACM",
      description: "The requested tracker could not be found.",
    };
  }
}
