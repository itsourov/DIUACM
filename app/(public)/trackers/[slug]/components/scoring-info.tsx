import { Info } from "lucide-react";

interface ScoringInfoProps {
  weightOfUpsolve: number;
  considerStrictAttendance: boolean;
}

export function ScoringInfo({
  weightOfUpsolve,
  considerStrictAttendance,
}: ScoringInfoProps) {
  return (
    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
      <div className="flex items-start gap-2">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-slate-700 dark:text-slate-300">
          <p className="font-medium">Scoring Information</p>
          <ul className="mt-1 space-y-1 ml-4 list-disc text-slate-600 dark:text-slate-400">
            <li>
              Scores are calculated based on solve performance and upsolve
              counts
            </li>
            <li>
              Upsolve weight:{" "}
              <span className="font-medium">{weightOfUpsolve}</span>
            </li>
            <li>Event weights are displayed under each event title</li>
            {considerStrictAttendance && (
              <li>
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  Strict Attendance:
                </span>{" "}
                Events marked with &quot;SA&quot; require attendance. Users
                without attendance will have their solves counted as upsolves
                only.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
