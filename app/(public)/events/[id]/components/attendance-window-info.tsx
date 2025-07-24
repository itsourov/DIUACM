"use client";

import { format, formatDistanceToNow, isFuture, isPast } from "date-fns";

interface AttendanceWindowInfoProps {
  startingAt: string | Date;
  endingAt: string | Date;
}

export function AttendanceWindowInfo({
  startingAt,
  endingAt,
}: AttendanceWindowInfoProps) {
  const startDate = new Date(startingAt);
  const endDate = new Date(endingAt);

  // Calculate attendance window times (15 minutes before start, 15 minutes after end)
  const startWindowTime = new Date(startDate);
  startWindowTime.setMinutes(startWindowTime.getMinutes() - 15);

  const endWindowTime = new Date(endDate);
  endWindowTime.setMinutes(endWindowTime.getMinutes() + 15);

  const attendanceWindowPassed = isPast(endWindowTime);
  const attendanceWindowFuture = isFuture(startWindowTime);

  return (
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
            {!attendanceWindowPassed && !attendanceWindowFuture && (
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
  );
}
