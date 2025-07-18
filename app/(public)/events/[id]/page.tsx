import { notFound } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow, isFuture, isPast } from "date-fns";
import { EventType, VisibilityStatus } from "@/db/schema";
import {
  getEventDetails,
  getEventSolveStats,
  checkIfUserHasAttendance,
  getEventAttendanceList,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Clock,
  ExternalLink,
  Users,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceModal } from "./components/attendance-modal";
import { EventSolveStats } from "./components/event-solve-stats";
import { EventAttendanceList } from "./components/event-attendance-list";
import { auth } from "@/lib/auth";
import { Separator } from "@/components/ui/separator";

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
  if (event.status !== VisibilityStatus.PUBLISHED) {
    return (
      <div className="container mx-auto p-4">
        <p>Event is not public. </p>
      </div>
    );
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
  // 4. We're within the attendance window
  const showAttendanceButton =
    event.openForAttendance &&
    !!session?.user &&
    !userHasAttendance &&
    (isWithinAttendanceWindow || !attendanceWindowPassed);

  const isContest = event.type === EventType.CONTEST;
  const hasAttendanceList =
    event.openForAttendance && attendanceList && attendanceList.length > 0;
  const hasSolveStats = isContest && solveStats && solveStats.length > 0;
  const showTabs = hasAttendanceList && hasSolveStats;
  const defaultTab = hasSolveStats ? "stats" : "attendance";

  // Format event times for better display
  const eventDate = format(new Date(event.startingAt), "MMMM d, yyyy");
  const startTime = format(new Date(event.startingAt), "h:mm a");
  const endTime = format(new Date(event.endingAt), "h:mm a");

  // Event status calculation
  const eventStarted = isPast(new Date(event.startingAt));
  const eventEnded = isPast(new Date(event.endingAt));
  let eventStatus;

  if (!eventStarted) {
    eventStatus = "upcoming";
  } else if (eventStarted && !eventEnded) {
    eventStatus = "ongoing";
  } else {
    eventStatus = "completed";
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mx-auto space-y-8">
        {/* Event Header Section - Enhanced with gradient styling from event-row */}
        <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-all overflow-hidden group hover:shadow-lg">
          <div className="p-6 md:p-8 relative z-10">
            {/* Event Title and Type */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {eventStatus === "upcoming" && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900">
                      Upcoming
                    </Badge>
                  )}
                  {eventStatus === "ongoing" && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900">
                      Ongoing
                    </Badge>
                  )}
                  {eventStatus === "completed" && (
                    <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                      Completed
                    </Badge>
                  )}
                  <Badge variant="outline">{event.type.toLowerCase()}</Badge>
                  <Badge variant="outline">
                    {event.participationScope.toLowerCase().replace(/_/g, " ")}
                  </Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  {event.title}
                </h1>
              </div>

              {event.eventLink && (
                <Button
                  asChild
                  variant="outline"
                  className="h-10 gap-2 rounded-full px-4"
                >
                  <Link
                    href={event.eventLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Event Link
                  </Link>
                </Button>
              )}
            </div>

            {/* Event Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Date
                  </p>
                  <p className="text-slate-900 dark:text-white font-medium">
                    {eventDate}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Time
                  </p>
                  <p className="text-slate-900 dark:text-white font-medium">
                    {startTime} - {endTime}
                  </p>
                </div>
              </div>
            </div>

            {/* Event Description (if available) */}
            {event.description && (
              <div className="mb-6">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                    {event.description.split("\n").map((paragraph, index) =>
                      paragraph.trim() ? (
                        <p key={index} className={index > 0 ? "mt-4" : ""}>
                          {paragraph}
                        </p>
                      ) : null
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Section */}
            {event.openForAttendance && (
              <div className="mt-6">
                <Separator className="my-6" />

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Attendance
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {session?.user
                        ? userHasAttendance
                          ? "You have successfully given attendance for this event."
                          : showAttendanceButton
                          ? "Attendance is currently open for this event."
                          : `Attendance is ${
                              attendanceWindowPassed
                                ? "closed"
                                : attendanceWindowFuture
                                ? "not open yet"
                                : "not available"
                            } for this event.`
                        : "Please log in to give attendance for this event."}
                    </p>
                  </div>

                  {showAttendanceButton ? (
                    <AttendanceModal
                      eventId={eventId}
                      requiresPassword={!!event.eventPassword}
                    />
                  ) : session?.user ? (
                    userHasAttendance ? (
                      <Button
                        variant="secondary"
                        disabled
                        className="h-10 rounded-full"
                      >
                        <CalendarCheck className="mr-2 h-4 w-4" />
                        Attendance Submitted
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        disabled
                        className="h-10 rounded-full"
                      >
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
                    <Button
                      variant="secondary"
                      asChild
                      className="h-10 rounded-full"
                    >
                      <Link href="/login">
                        <Users className="mr-2 h-4 w-4" />
                        Login to give attendance
                      </Link>
                    </Button>
                  )}
                </div>

                {session?.user && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Attendance Window
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          Opens: {format(startWindowTime, "MMM d, h:mm a")}
                          {attendanceWindowFuture && (
                            <span className="ml-1 text-slate-500 dark:text-slate-400">
                              (
                              {formatDistanceToNow(startWindowTime, {
                                addSuffix: true,
                              })}
                              )
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          Closes: {format(endWindowTime, "MMM d, h:mm a")}
                          {!attendanceWindowPassed &&
                            !attendanceWindowFuture && (
                              <span className="ml-1 text-slate-500 dark:text-slate-400">
                                (
                                {formatDistanceToNow(endWindowTime, {
                                  addSuffix: true,
                                })}
                                )
                              </span>
                            )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs Section: Statistics & Attendance - Also Enhanced with gradient styling */}
        {(hasSolveStats || hasAttendanceList) && (
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-all overflow-hidden group hover:shadow-lg">
            <div className="p-6 relative z-10">
              {showTabs ? (
                <Tabs defaultValue={defaultTab}>
                  <TabsList className="mb-6 p-1 bg-slate-100 dark:bg-slate-800 w-full sm:w-fit">
                    <TabsTrigger
                      value="stats"
                      className="flex items-center gap-2 rounded-lg"
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>Solve Statistics</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="attendance"
                      className="flex items-center gap-2 rounded-lg"
                    >
                      <Users className="h-4 w-4" />
                      <span>Attendees ({attendanceList.length})</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="stats" className="p-0 mt-4">
                    <EventSolveStats stats={solveStats} />
                  </TabsContent>

                  <TabsContent value="attendance" className="p-0 mt-4">
                    <EventAttendanceList attendees={attendanceList} />
                  </TabsContent>
                </Tabs>
              ) : (
                <>
                  {hasSolveStats && (
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Solve Statistics
                      </h2>
                      <EventSolveStats stats={solveStats} />
                    </div>
                  )}

                  {hasAttendanceList && (
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Attendees ({attendanceList.length})
                      </h2>
                      <EventAttendanceList attendees={attendanceList} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
