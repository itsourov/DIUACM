import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface RankListNotFoundProps {
  trackerSlug: string;
  requestedKeyword: string;
  availableRankLists: string[];
}

export function RankListNotFound({
  trackerSlug,
  requestedKeyword,
  availableRankLists,
}: RankListNotFoundProps) {
  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <Alert className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Rank List Not Found</AlertTitle>
        <AlertDescription className="mt-2">
          The rank list with keyword &quot;{requestedKeyword}&quot; was not
          found for this tracker.
        </AlertDescription>
      </Alert>

      <div className="max-w-2xl mx-auto mt-8">
        <h3 className="text-lg font-semibold mb-4">Available Rank Lists:</h3>

        {availableRankLists.length > 0 ? (
          <div className="space-y-2">
            {availableRankLists.map((keyword) => (
              <div key={keyword}>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href={`/trackers/${trackerSlug}/${keyword}`}>
                    {keyword}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">
            No rank lists available for this tracker.
          </p>
        )}

        <div className="mt-6">
          <Button asChild variant="secondary">
            <Link href={`/trackers/${trackerSlug}`}>
              View Default Rank List
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
