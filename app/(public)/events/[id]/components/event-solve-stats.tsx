import { UserSolveStatOnEvent, User } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

type SolveStatWithUser = UserSolveStatOnEvent & {
  user: Pick<
    User,
    "id" | "name" | "username" | "image" | "department" | "studentId"
  >;
};

interface EventSolveStatsProps {
  stats: SolveStatWithUser[];
}

export function EventSolveStats({ stats }: EventSolveStatsProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Solve Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {stats.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No solve statistics available yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead className="text-center">Solves</TableHead>
                  <TableHead className="text-center">Upsolves</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((stat, index) => (
                  <TableRow key={stat.id}>
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {stat.user.image && (
                            <Image
                              src={stat.user.image}
                              alt={stat.user.name}
                              width={40}
                              height={40}
                            />
                          )}
                          <AvatarFallback>
                            {getInitials(stat.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{stat.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {stat.user.username}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{stat.solveCount}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{stat.upsolveCount}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {stat.solveCount + stat.upsolveCount}
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
