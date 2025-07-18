import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TrackerNotFound() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Tracker Not Found
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              The tracker you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/trackers" className="inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Trackers
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
