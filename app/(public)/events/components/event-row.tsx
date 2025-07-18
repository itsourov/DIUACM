"use client";

import { isAfter, isWithinInterval } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Event } from "../actions";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Users, ArrowUpRight } from "lucide-react";
import { EventType } from "@/db/schema";

type EventRowProps = {
  event: Event;
  isOwner?: boolean;
};

// Configure attendance scope display
const getScopeConfig = (scope: string) => {
  switch (scope) {
    case "OPEN_FOR_ALL":
      return {
        icon: "👥",
        label: "Open for All",
        shortLabel: "Open for All",
      };
    case "ONLY_GIRLS":
      return {
        icon: "👩",
        label: "Girls Only",
        shortLabel: "Girls",
      };
    case "JUNIOR_PROGRAMMERS":
      return {
        icon: "🌱",
        label: "Junior Programmers",
        shortLabel: "Junior",
      };
    case "SELECTED_PERSONS":
      return {
        icon: "✨",
        label: "Selected Persons",
        shortLabel: "Selected",
      };
    default:
      return {
        icon: "👥",
        label: "Open for All",
        shortLabel: "Open",
      };
  }
};

// Format event status in human-readable format
const formatEventStatus = (startDate: Date, now: Date): string => {
  const diffInMinutes = Math.floor(
    (startDate.getTime() - now.getTime()) / (1000 * 60)
  );
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `in ${diffInDays} day${diffInDays > 1 ? "s" : ""}`;
  }
  if (diffInHours > 0) {
    return `in ${diffInHours} hour${diffInHours > 1 ? "s" : ""}`;
  }
  if (diffInMinutes > 0) {
    return `in ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
  }
  return "Starting soon";
};

// Format date range for display
const formatDateRange = (startDate: Date, endDate: Date) => {
  const startFormat = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(startDate);

  const endFormat = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(endDate);

  return `${startFormat} - ${endFormat}`;
};

// Format date for display
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export function EventRow({ event }: EventRowProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const startDate = new Date(event.startingAt);
  const endDate = new Date(event.endingAt);

  const isUpcoming = isAfter(startDate, currentTime);
  const isRunning = isWithinInterval(currentTime, {
    start: startDate,
    end: endDate,
  });

  // Calculate duration in minutes for consistent display
  const durationInMinutes = Math.round(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60)
  );

  const formatDuration = () => {
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
  };

  const getStatusBadge = () => {
    if (isRunning)
      return (
        <Badge
          variant="outline"
          className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-300/70 dark:border-blue-700/70 text-blue-700 dark:text-blue-300 shadow-sm"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
            Happening Now
          </span>
        </Badge>
      );
    if (isUpcoming)
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30"
        >
          {formatEventStatus(startDate, currentTime)}
        </Badge>
      );
    return (
      <Badge
        variant="secondary"
        className="bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
      >
        Ended
      </Badge>
    );
  };

  const scopeConfig = getScopeConfig(event.participationScope);

  // Calculate progress percentage for running events
  const progress = isRunning
    ? Math.min(
        100,
        ((currentTime.getTime() - startDate.getTime()) /
          (endDate.getTime() - startDate.getTime())) *
          100
      )
    : 0;

  // Get attendance count
  const attendanceCount = event._count?.attendances || 0;

  // Determine badge style based on event type
  const getEventTypeBadgeStyle = () => {
    switch (event.type) {
      case EventType.CONTEST:
        return "bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white border-none shadow-sm";
      case EventType.CLASS:
        return "bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 text-white border-none shadow-sm";
      default:
        return "bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 text-white border-none shadow-sm";
    }
  };

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-all overflow-hidden group hover:shadow-lg">
      {/* Ambient light effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300 -z-10"></div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 opacity-50 -z-10"></div>

      {/* Decorative accent element */}
      <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-blue-100/40 dark:bg-blue-900/20 -z-10"></div>

      <Link href={`/events/${event.id}`} className="block p-5 relative z-10">
        {/* Top row with title and status */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
              {event.title}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-blue-500" />
                <span>{formatDate(startDate)}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>{formatDateRange(startDate, endDate)}</span>
              </div>
            </div>
          </div>

          <div className="sm:self-start">{getStatusBadge()}</div>
        </div>

        {/* Tags section */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge
            variant="default"
            className={`${getEventTypeBadgeStyle()} capitalize`}
          >
            {event.type === EventType.CLASS && "📚 "}
            {event.type === EventType.CONTEST && "🏆 "}
            {event.type === EventType.OTHER && "📋 "}
            {event.type.toLowerCase()}
          </Badge>

          <Badge
            variant="outline"
            className="bg-white/30 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700"
          >
            {scopeConfig.icon} {scopeConfig.label}
          </Badge>

          <Badge
            variant="outline"
            className="bg-white/30 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700"
          >
            ⏱️ {formatDuration()}
          </Badge>
        </div>

        {/* Attendance information */}
        {event.openForAttendance && (
          <div className="mt-4 flex items-center text-sm text-slate-600 dark:text-slate-400">
            <Users className="h-4 w-4 mr-1.5 text-blue-500" />
            <span className="flex items-center gap-1">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {attendanceCount}
              </span>
              {attendanceCount === 1 ? "attendee" : "attendees"}
            </span>
          </div>
        )}

        {/* Progress Indicator for Running Events */}
        {isRunning && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>{Math.round(progress)}% complete</span>
              <span>
                Time remaining: {formatEventStatus(endDate, currentTime)}
              </span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                suppressHydrationWarning
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Arrow indicator for clickable card */}
        <div className="absolute bottom-4 right-4 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
          <ArrowUpRight className="h-4 w-4 text-blue-700 dark:text-blue-400" />
        </div>
      </Link>
    </div>
  );
}
