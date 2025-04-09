"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Edit, Trash2, TrendingUp } from "lucide-react";
import type { RankList } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { deleteRanklist } from "@/app/admin/trackers/[id]/ranklists/actions";

type RankListWithCounts = RankList & {
  _count: {
    eventRankLists: number;
    rankListUsers: number;
  };
};

interface RanklistsListProps {
  trackerId: string;
  initialRanklists: RankListWithCounts[];
}

export function RanklistsList({
  trackerId,
  initialRanklists,
}: RanklistsListProps) {
  const [ranklists, setRanklists] =
    useState<RankListWithCounts[]>(initialRanklists);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteRanklist = async (ranklistId: string) => {
    try {
      setIsDeleting(ranklistId);
      const response = await deleteRanklist(ranklistId, trackerId);
      if (response.success) {
        setRanklists(
          ranklists.filter((ranklist) => ranklist.id !== ranklistId)
        );
        toast.success("Ranklist deleted successfully");
      } else {
        toast.error(response.error || "Failed to delete ranklist");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-xl">
          <TrendingUp className="h-5 w-5 mr-2" />
          Ranklists ({ranklists.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ranklists.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="rounded-full bg-muted p-3">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No ranklists yet</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-xs">
              Start adding ranklists to this tracker using the &quot;Add
              Ranklist&quot; button.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ranklist Details</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranklists.map((ranklist) => (
                  <TableRow key={ranklist.id}>
                    <TableCell>
                      <div className="space-y-1.5">
                        <div className="font-medium text-base">
                          {ranklist.keyword}
                        </div>
                        {ranklist.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                            {ranklist.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-sm">
                          {ranklist._count.eventRankLists} event
                          {ranklist._count.eventRankLists !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-sm">
                          {ranklist._count.rankListUsers} user
                          {ranklist._count.rankListUsers !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(ranklist.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          asChild
                        >
                          <Link
                            href={`/admin/trackers/${trackerId}/ranklists/${ranklist.id}/edit`}
                            className="flex items-center justify-center"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          disabled={isDeleting === ranklist.id}
                          onClick={() => handleDeleteRanklist(ranklist.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
