import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow, isFuture, isPast } from "date-fns";
import { EventType, Visibility } from "@prisma/client";
import {
  getEventDetails,
  getEventSolveStats,
  checkIfUserHasAttendance,
  getEventAttendanceList,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Clock,
  ExternalLink,
  Users,
  CalendarCheck,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceModal } from "./components/attendance-modal";
import { EventSolveStats } from "./components/event-solve-stats";
import { EventAttendanceList } from "./components/event-attendance-list";
import { auth } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EventDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventDetailsPage({
  params,
}: EventDetailsPageProps) {
  // awaitedParams is required for new nextjs 15 app router
  const awaitedParams = await params;
  const eventId = parseInt(awaitedParams.id);

  if (isNaN(eventId)) {
    notFound();
  }

  const [eventResponse, solveStatsResponse, attendanceResponse, session] =
    await Promise.all([
      getEventDetails(eventId),
      getEventSolveStats(eventId),
      getEventAttendanceList(eventId),
      auth(),
    ]);

  if (!eventResponse.success || !eventResponse.data) {
    notFound();
  }

  const event = eventResponse.data;
  const solveStats = solveStatsResponse.success ? solveStatsResponse.data : [];
  const attendanceList = attendanceResponse.success
    ? attendanceResponse.data
    : [];

  // Check if event is published
  if (event.status !== Visibility.PUBLISHED) {
    redirect("/events");
  }

  // Check if current user has attendance
  let userHasAttendance = false;

  if (session?.user) {
    const attendanceCheckResponse = await checkIfUserHasAttendance(eventId);
    userHasAttendance =
      attendanceCheckResponse.success &&
      attendanceCheckResponse.hasAttendance === true;
  }

  // Calculate attendance window times
  const now = new Date();
  const startWindowTime = new Date(event.startingAt);
  startWindowTime.setMinutes(startWindowTime.getMinutes() - 15);

  const endWindowTime = new Date(event.endingAt);
  endWindowTime.setMinutes(endWindowTime.getMinutes() + 15);

  const isWithinAttendanceWindow =
    now >= startWindowTime && now <= endWindowTime;
  const attendanceWindowPassed = isPast(endWindowTime);
  const attendanceWindowFuture = isFuture(startWindowTime);

  // Show attendance button if:
  // 1. Event is open for attendance
  // 2. User is logged in
  // 3. User doesn't already have attendance
  // 4. We're within the attendance window OR strictAttendance is false
  const showAttendanceButton =
    event.openForAttendance &&
    !!session?.user &&
    !userHasAttendance &&
    (isWithinAttendanceWindow ||
      (!event.strictAttendance && !attendanceWindowPassed));

  const isContest = event.type === EventType.CONTEST;
  const hasAttendanceList =
    event.openForAttendance && attendanceList && attendanceList.length > 0;
  const hasSolveStats = isContest && solveStats && solveStats.length > 0;
  const showTabs = hasAttendanceList && hasSolveStats;
  const defaultTab = hasSolveStats ? "stats" : "attendance";

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                      {event.title}
                    </h1>
                    <div className="space-x-2">
                      <Badge>{event.type.toLowerCase()}</Badge>
                      <Badge variant="outline">
                        {event.participationScope
                          .toLowerCase()
                          .replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center text-muted-foreground space-x-4">
                    <div className="flex items-center">
                      <CalendarDays className="mr-1 h-4 w-4" />
                      <span>
                        {format(new Date(event.startingAt), "MMMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>
                        {format(new Date(event.startingAt), "h:mm a")} -{" "}
                        {format(new Date(event.endingAt), "h:mm a")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {event.eventLink && (
                    <Button asChild variant="outline">
                      <Link
                        href={event.eventLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Event Link
                      </Link>
                    </Button>
                  )}

                  {event.openForAttendance && (
                    <>
                      {showAttendanceButton ? (
                        <AttendanceModal
                          eventId={eventId}
                          requiresPassword={!!event.eventPassword}
                        />
                      ) : session?.user ? (
                        userHasAttendance ? (
                          <Button variant="secondary" disabled>
                            <CalendarCheck className="mr-2 h-4 w-4" />
                            Attendance Submitted
                          </Button>
                        ) : (
                          <Button variant="secondary" disabled>
                            <Clock className="mr-2 h-4 w-4" />
                            Attendance{" "}
                            {attendanceWindowPassed
                              ? "Window Closed"
                              : attendanceWindowFuture
                              ? "Not Open Yet"
                              : "Not Available"}
                          </Button>
                        )
                      ) : (
                        <Button variant="secondary" asChild>
                          <Link href="/login">
                            <Users className="mr-2 h-4 w-4" />
                            Login to give attendance
                          </Link>
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {event.openForAttendance && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Attendance
                    </h2>

                    {session?.user ? (
                      <div className="space-y-4 mt-2">
                        {userHasAttendance ? (
                          <p className="text-green-600 dark:text-green-400 font-medium">
                            You have successfully given attendance for this
                            event.
                          </p>
                        ) : showAttendanceButton ? (
                          <p>Attendance is currently open for this event.</p>
                        ) : (
                          <>
                            <p>
                              Attendance is{" "}
                              {attendanceWindowPassed
                                ? "closed"
                                : attendanceWindowFuture
                                ? "not open yet"
                                : "not available"}{" "}
                              for this event.
                            </p>
                            {event.strictAttendance && (
                              <Alert variant="destructive" className="mt-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                  This event has strict attendance policy.
                                </AlertDescription>
                              </Alert>
                            )}
                          </>
                        )}

                        <div className="border rounded-md p-3 bg-muted/50">
                          <h3 className="text-sm font-medium mb-2">
                            Attendance Window
                          </h3>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>
                              <span className="font-medium">Opens:</span>{" "}
                              {format(startWindowTime, "MMM d, h:mm a")}
                              {attendanceWindowFuture && (
                                <span className="ml-1 text-muted-foreground">
                                  (
                                  {formatDistanceToNow(startWindowTime, {
                                    addSuffix: true,
                                  })}
                                  )
                                </span>
                              )}
                            </p>
                            <p>
                              <span className="font-medium">Closes:</span>{" "}
                              {format(endWindowTime, "MMM d, h:mm a")}
                              {!attendanceWindowPassed &&
                                !attendanceWindowFuture && (
                                  <span className="ml-1 text-muted-foreground">
                                    (
                                    {formatDistanceToNow(endWindowTime, {
                                      addSuffix: true,
                                    })}
                                    )
                                  </span>
                                )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">
                        Please log in to give attendance for this event.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Show tabs if both solve stats and attendance list are available */}
        {showTabs ? (
          <div className="mt-8">
            <Tabs defaultValue={defaultTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="stats" className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Solve Statistics
                </TabsTrigger>
                <TabsTrigger value="attendance" className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Attendees ({attendanceList.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stats">
                <EventSolveStats stats={solveStats} />
              </TabsContent>

              <TabsContent value="attendance">
                <EventAttendanceList attendees={attendanceList} />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <>
            {/* Show individual sections if only one is available */}
            {hasSolveStats && (
              <div className="mt-8">
                <EventSolveStats stats={solveStats} />
              </div>
            )}

            {hasAttendanceList && (
              <div className="mt-8">
                <EventAttendanceList attendees={attendanceList} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
