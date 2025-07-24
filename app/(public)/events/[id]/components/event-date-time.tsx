"use client";

import { format } from "date-fns";
import { CalendarDays, Clock } from "lucide-react";

interface EventDateTimeProps {
  startingAt: string | Date;
  endingAt: string | Date;
}

export function EventDateTime({ startingAt, endingAt }: EventDateTimeProps) {
  const startDate = new Date(startingAt);
  const endDate = new Date(endingAt);

  // Format event times for better display using local timezone
  const eventDate = format(startDate, "MMMM d, yyyy");
  const startTime = format(startDate, "h:mm a");
  const endTime = format(endDate, "h:mm a");

  return (
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
  );
}
