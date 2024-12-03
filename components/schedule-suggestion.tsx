import { format, addMinutes, parseISO } from "date-fns";
import { useState } from "react";
import { Schedule } from "@/components/schedule";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ScheduleSuggestionProps {
  schedule: Schedule;
  suggestedTime: string | null;
  message: string;
  duration?: number;
  onSchedule?: (eventDetails: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    attendees: string[];
  }) => void;
}

export function ScheduleSuggestion({
  schedule,
  suggestedTime,
  message,
  duration = 60,
  onSchedule,
}: ScheduleSuggestionProps) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attendees, setAttendees] = useState("");

  // Calculate end time based on duration
  const endTime = suggestedTime
    ? format(
        addMinutes(parseISO(suggestedTime), duration),
        "yyyy-MM-dd'T'HH:mm"
      )
    : null;

  const handleSchedule = () => {
    if (!suggestedTime || !onSchedule) return;

    onSchedule({
      title,
      description,
      startTime: suggestedTime,
      endTime: endTime!,
      attendees: attendees
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean),
    });

    setIsScheduling(false);
    setTitle("");
    setDescription("");
    setAttendees("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setter: (value: string) => void
  ) => {
    setter(e.target.value);
  };

  // Helper function to create a UTC date from a date string
  function createUTCDate(dateString: string): Date {
    if (dateString.length === 10) {
      return new Date(`${dateString}T00:00:00`);
    }
    return new Date(dateString);
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <Schedule
        schedule={schedule}
        suggestedTime={suggestedTime || ""}
        isHighlighted={!!suggestedTime}
      />

      <div className="flex flex-col gap-2 p-4 rounded-lg bg-white/50 dark:bg-white/10">
        <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>

        {suggestedTime && (
          <div className="flex items-center gap-2 mt-2">
            <Button
              onClick={() => setIsScheduling(true)}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Schedule This Time
            </Button>
            <span className="text-sm text-gray-500">
              {format(createUTCDate(suggestedTime), "EEEE, MMMM d 'at' h:mm a")}
            </span>
          </div>
        )}

        <Dialog open={isScheduling} onClose={() => setIsScheduling(false)}>
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Input
              placeholder="Meeting Title"
              value={title}
              onChange={(e) => handleInputChange(e, setTitle)}
              autoFocus
            />
            <textarea
              placeholder="Meeting Description (optional)"
              value={description}
              onChange={(e) => handleInputChange(e, setDescription)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            />
            <Input
              placeholder="Attendees (comma-separated emails)"
              value={attendees}
              onChange={(e) => handleInputChange(e, setAttendees)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduling(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={!title}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Confirm Schedule
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </div>
  );
}
