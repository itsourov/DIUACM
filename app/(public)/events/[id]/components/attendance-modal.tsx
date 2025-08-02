"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitAttendance } from "../actions";

interface AttendanceModalProps {
  eventId: number;
  requiresPassword: boolean;
  disabled?: boolean;
  onAttendanceSubmitted?: () => void;
}

export function AttendanceModal({
  eventId,
  requiresPassword,
  disabled = false,
  onAttendanceSubmitted,
}: AttendanceModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitAttendance(eventId, password);

      if (result.success) {
        toast.success(result.message || "Attendance recorded successfully");
        setIsOpen(false);
        setPassword("");
        if (onAttendanceSubmitted) {
          onAttendanceSubmitted();
        }
      } else {
        toast.error(result.error || "Failed to record attendance");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="h-10 rounded-full px-5"
          disabled={disabled}
        >
          <CalendarCheck className="mr-2 h-4 w-4" />
          Give Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-xl border-slate-200 dark:border-slate-700 p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl text-slate-900 dark:text-white">
            Event Attendance
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 pt-2">
            {requiresPassword
              ? "Please enter the event password to confirm your attendance."
              : "Click submit to confirm your attendance for this event."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {requiresPassword && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="password"
                  className="text-slate-700 dark:text-slate-300"
                >
                  Event Password
                </Label>
                <Input
                  id="password"
                  type="text"
                  placeholder="Enter event password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  className="rounded-lg border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
            </div>
          )}
          <DialogFooter className="mt-4 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full w-full sm:w-auto"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Submitting..." : "Submit Attendance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
