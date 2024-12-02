import { addDays, format, parseISO } from "date-fns";
import { Schedule, ScheduleEvent } from "@/components/schedule";

// This represents the schedule of the person being managed (e.g., a busy executive)
let MANAGED_SCHEDULE_DB: ScheduleEvent[] = [
  {
    id: "1",
    title: "Team Standup",
    startTime: "2024-03-19T09:00",
    endTime: "2024-03-19T09:30",
    description: "Daily team sync",
    attendees: ["team@company.com"],
  },
  {
    id: "2",
    title: "Lunch Break",
    startTime: "2024-03-19T12:00",
    endTime: "2024-03-19T13:00",
    description: "Reserved for lunch",
    attendees: [],
  },
  {
    id: "3",
    title: "Product Review",
    startTime: "2024-03-19T14:00",
    endTime: "2024-03-19T15:30",
    description: "Q1 product roadmap review",
    attendees: ["product@company.com"],
  },
  {
    id: "4",
    title: "Client Meeting",
    startTime: "2024-03-20T10:00",
    endTime: "2024-03-20T11:00",
    description: "Project status update",
    attendees: ["client@company.com"],
  },
  {
    id: "5",
    title: "Team Training",
    startTime: "2024-03-20T15:00",
    endTime: "2024-03-20T16:30",
    description: "New tools training session",
    attendees: ["team@company.com"],
  },
  {
    id: "6",
    title: "Team Training",
    startTime: "2024-12-02T15:00",
    endTime: "2024-12-02T16:30",
    description: "New tools training session",
    attendees: ["team@company.com"],
  },
];

// Helper function to get date string without time component
function getDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Helper function to generate a unique ID
function generateEventId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function getUserSchedule(
  startDate: Date = new Date(),
  daysToFetch: number = 5
): Schedule {
  console.log("getUserSchedule input:", {
    startDate: startDate.toISOString(),
    daysToFetch,
  });
  const schedules = [];
  const baseDate = new Date(getDateString(startDate) + "T00:00:00.000Z");

  for (let i = 0; i < daysToFetch; i++) {
    const currentDate = addDays(baseDate, i);
    const dateStr = getDateString(currentDate);

    // Filter events for the current date
    const dayEvents = MANAGED_SCHEDULE_DB.filter(
      (event) => event.startTime.split("T")[0] === dateStr
    );

    schedules.push({
      date: dateStr,
      events: dayEvents.sort(
        (a, b) =>
          parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
      ),
    });
  }

  return { schedules };
}

export function findAvailableSlots(
  date: Date,
  duration: number = 60, // duration in minutes
  startHour: number = 9, // default work day starts at 9 AM
  endHour: number = 17 // default work day ends at 5 PM
): { startTime: string; endTime: string }[] {
  // Create a date string that preserves the local date
  const dateStr = format(date, "yyyy-MM-dd");

  // Get events for the day and sort them by start time
  const dayEvents = MANAGED_SCHEDULE_DB.filter(
    (event) => event.startTime.split("T")[0] === dateStr
  ).sort(
    (a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
  );

  const availableSlots = [];

  // Create dates in local time to prevent timezone shifts
  const workDayStart = new Date(
    dateStr + `T${String(startHour).padStart(2, "0")}:00`
  );
  const workDayEnd = new Date(
    dateStr + `T${String(endHour).padStart(2, "0")}:00`
  );

  // If no events, return the entire work day divided into slots
  if (dayEvents.length === 0) {
    let currentTime = new Date(workDayStart);
    while (currentTime <= workDayEnd) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60000);
      if (slotEnd <= workDayEnd) {
        availableSlots.push({
          startTime: format(currentTime, "yyyy-MM-dd'T'HH:mm"),
          endTime: format(slotEnd, "yyyy-MM-dd'T'HH:mm"),
        });
      }
      // Move to next 30-minute increment
      currentTime = new Date(currentTime.getTime() + 30 * 60000);
    }
    return availableSlots;
  }

  // Check for slot before first event
  let currentTime = new Date(workDayStart);
  const firstEventStart = parseISO(dayEvents[0].startTime);
  if (currentTime < firstEventStart) {
    while (currentTime < firstEventStart) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60000);
      if (slotEnd <= firstEventStart) {
        availableSlots.push({
          startTime: format(currentTime, "yyyy-MM-dd'T'HH:mm"),
          endTime: format(slotEnd, "yyyy-MM-dd'T'HH:mm"),
        });
      }
      currentTime = new Date(currentTime.getTime() + 30 * 60000);
    }
  }

  // Check for slots between events
  for (let i = 0; i < dayEvents.length - 1; i++) {
    const currentEventEnd = parseISO(dayEvents[i].endTime);
    const nextEventStart = parseISO(dayEvents[i + 1].startTime);

    // Calculate gap between events
    const gapDuration =
      (nextEventStart.getTime() - currentEventEnd.getTime()) / 60000;

    // If gap is large enough for the requested duration
    if (gapDuration >= duration) {
      currentTime = new Date(currentEventEnd);
      while (currentTime < nextEventStart) {
        const slotEnd = new Date(currentTime.getTime() + duration * 60000);
        if (slotEnd <= nextEventStart) {
          availableSlots.push({
            startTime: format(currentTime, "yyyy-MM-dd'T'HH:mm"),
            endTime: format(slotEnd, "yyyy-MM-dd'T'HH:mm"),
          });
        }
        currentTime = new Date(currentTime.getTime() + 30 * 60000);
      }
    }
  }

  // Check for slot after last event
  const lastEventEnd = parseISO(dayEvents[dayEvents.length - 1].endTime);
  if (lastEventEnd < workDayEnd) {
    currentTime = new Date(lastEventEnd);
    while (currentTime < workDayEnd) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60000);
      if (slotEnd <= workDayEnd) {
        availableSlots.push({
          startTime: format(currentTime, "yyyy-MM-dd'T'HH:mm"),
          endTime: format(slotEnd, "yyyy-MM-dd'T'HH:mm"),
        });
      }
      currentTime = new Date(currentTime.getTime() + 30 * 60000);
    }
  }

  return availableSlots;
}

export function addEventToSchedule(
  title: string,
  startTime: string,
  endTime: string,
  description?: string,
  attendees: string[] = []
): { success: boolean; event?: ScheduleEvent; error?: string } {
  console.log("addEventToSchedule input:", {
    title,
    startTime,
    endTime,
    description,
    attendees,
  });

  // Validate times
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { success: false, error: "Invalid date format" };
  }

  if (end <= start) {
    return { success: false, error: "End time must be after start time" };
  }

  // Check for conflicts
  const hasConflict = MANAGED_SCHEDULE_DB.some((event) => {
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);
    return (
      (start >= eventStart && start < eventEnd) ||
      (end > eventStart && end <= eventEnd) ||
      (start <= eventStart && end >= eventEnd)
    );
  });

  if (hasConflict) {
    return { success: false, error: "Time slot conflicts with existing event" };
  }

  // Create new event
  const newEvent: ScheduleEvent = {
    id: generateEventId(),
    title,
    startTime,
    endTime,
    description,
    attendees,
  };

  // Add to schedule
  MANAGED_SCHEDULE_DB = [...MANAGED_SCHEDULE_DB, newEvent];

  return { success: true, event: newEvent };
}
