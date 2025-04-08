"use client";

import { useState } from "react";
import { getUserSolveStats } from "../../actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History } from "lucide-react";

// Define a proper type for the solve stats
interface EventStat {
  id: string;
  userId: string;
  eventId: number;
  solveCount: number;
  upsolveCount: number;
  participation: boolean;
  weight: number;
  upsolveWeight: number;
  points: number;
  event: {
    id: number;
    title: string;
    startingAt: Date | string;
    endingAt: Date | string;
  };
}

interface UserStatsModalProps {
  userId: string;
  userName: string;
  rankListId: string;
}

export function UserStatsModal({
  userId,
  userName,
  rankListId,
}: UserStatsModalProps) {
  const [solveStats, setSolveStats] = useState<EventStat[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);

    // Fetch data when opening the modal
    if (open && !solveStats) {
      setIsLoading(true);
      try {
        const stats = await getUserSolveStats(userId, rankListId);
        setSolveStats(stats);
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const totalPoints =
    solveStats?.reduce((sum, stat) => sum + stat.points, 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-sm font-normal">
          <History className="h-3.5 w-3.5 mr-1.5" />
          View History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader className="border-b pb-3">
          <DialogTitle>Point History for {userName}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Total points summary */}
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h3 className="font-medium">Total Points</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sum of all event contributions
                </p>
              </div>
              <div className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                {totalPoints.toFixed(2)}
              </div>
            </div>

            {/* Event stats table - Simplified */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead className="text-center">Solves</TableHead>
                    <TableHead className="text-center">Upsolves</TableHead>
                    <TableHead className="text-center">Weight</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solveStats && solveStats.length > 0 ? (
                    solveStats.map((stat) => (
                      <TableRow key={stat.id}>
                        <TableCell>
                          <div className="font-medium">{stat.event.title}</div>
                          {stat.event.startingAt && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(
                                stat.event.startingAt
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {stat.solveCount}
                        </TableCell>
                        <TableCell className="text-center">
                          {stat.upsolveCount}
                        </TableCell>
                        <TableCell className="text-center">
                          {stat.weight.toFixed(2)}
                          {stat.upsolveCount > 0 && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Upsolve: {stat.upsolveWeight.toFixed(2)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {stat.points.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        {solveStats === null ? (
                          <span>Failed to load stats</span>
                        ) : (
                          <span>No event participation found</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Simplified calculation explanation */}
            <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 border-t">
              <p className="font-medium mb-1">Points calculation:</p>
              <p>
                Event points = (Solves × Weight) + (Upsolves ×{" "}
                {solveStats?.[0]?.upsolveWeight.toFixed(2) || "0.25"} × Weight)
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
