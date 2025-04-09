"use client";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Edit, Trash2, Users } from "lucide-react";
import { Team } from "@prisma/client";
import { deleteTeam } from "../actions";
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

type TeamWithMemberCount = Team & {
  _count: {
    members: number;
  };
};

interface TeamsListProps {
  contestId: string;
  initialTeams: TeamWithMemberCount[];
}

export function TeamsList({ contestId, initialTeams }: TeamsListProps) {
  const [teams, setTeams] = useState<TeamWithMemberCount[]>(initialTeams);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteTeam = async (teamId: string) => {
    try {
      setIsDeleting(teamId);
      const response = await deleteTeam(teamId, contestId);
      if (response.success) {
        setTeams(teams.filter((team) => team.id !== teamId));
        toast.success("Team deleted successfully");
      } else {
        toast.error(response.error || "Failed to delete team");
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
          <Users className="h-5 w-5 mr-2" />
          Teams ({teams.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="rounded-full bg-muted p-3">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No teams yet</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-xs">
              Start adding teams to this contest using the &quot;Add Team&quot; button.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Solve Count</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>{team.rank || "—"}</TableCell>
                    <TableCell>{team.solveCount || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{team._count.members}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          asChild
                        >
                          <Link
                            href={`/admin/contests/${contestId}/teams/${team.id}/members`}
                          >
                            <Users className="h-4 w-4" />
                            <span className="sr-only">Manage Members</span>
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(team.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0"
                          asChild
                        >
                          <Link
                            href={`/admin/contests/${contestId}/teams/${team.id}/edit`}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 text-destructive"
                          disabled={isDeleting === team.id}
                          onClick={() => handleDeleteTeam(team.id)}
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
