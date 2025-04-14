import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldX, AlertTriangle, Home } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Unauthorized Access",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <Card className="w-full max-w-md p-8 space-y-6 text-center shadow-lg">
        <div className="flex justify-center">
          <div className="relative">
            <ShieldX className="h-20 w-20 text-red-500" strokeWidth={1.5} />
            <AlertTriangle
              className="h-8 w-8 text-amber-500 absolute bottom-0 right-0"
              strokeWidth={2}
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">
          Unauthorized Access
        </h1>

        <p className="text-muted-foreground">
          You don&apos;t have permission to access this area. Please contact an
          administrator if you believe this is a mistake.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button variant="default" asChild>
            <Link href="/admin">Back to Admin Dashboard</Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
