"use client";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Edit, Trash2, Users, Trophy, Target } from "lucide-react";
import type { Team } from "@/db/schema";
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
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type TeamWithMemberCount = Team & {
  _count: {
    members: number;
  };
  memberCount: number; // For the SQL result
};

interface TeamsListProps {
  contestId: number;
  initialTeams: TeamWithMemberCount[];
}

export function TeamsList({ contestId, initialTeams }: TeamsListProps) {
  const [teams, setTeams] = useState<TeamWithMemberCount[]>(initialTeams);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const handleDeleteTeam = async (teamId: number) => {
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
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Users className="h-5 w-5 mr-2" />
          Teams
          <Badge variant="secondary" className="ml-2">
            {teams.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="rounded-full bg-muted p-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No teams yet</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-xs">
              Create your first team to get started with this contest.
            </p>
            <Button asChild>
              <Link href={`/admin/contests/${contestId}/teams/create`}>
                <Users className="mr-2 h-4 w-4" />
                Create Team
              </Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <div className="font-medium">{team.name}</div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/contests/${contestId}/teams/${team.id}/members`}
                        className="flex items-center space-x-2 text-sm hover:text-primary transition-colors"
                      >
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{team._count.members} members</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {team.rank && (
                          <div className="flex items-center space-x-1">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">
                              #{team.rank}
                            </span>
                          </div>
                        )}
                        {team.solveCount !== null &&
                          team.solveCount !== undefined && (
                            <div className="flex items-center space-x-1">
                              <Target className="h-4 w-4 text-green-500" />
                              <span className="text-sm">
                                {team.solveCount} solved
                              </span>
                            </div>
                          )}
                        {!team.rank &&
                          (team.solveCount === null ||
                            team.solveCount === undefined) && (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                      </div>
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
                            href={`/admin/contests/${contestId}/teams/${team.id}/edit`}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit team</span>
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={isDeleting === team.id}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete team</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Team</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete team{" "}
                                <strong>{team.name}</strong>? This will also
                                remove all team members and cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTeam(team.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
