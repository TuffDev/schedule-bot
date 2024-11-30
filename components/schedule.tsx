import cx from "classnames";
import { format } from "date-fns";
import { useEffect, useState } from "react";

// Sample schedule data structure
export interface ScheduleEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
}

export interface DailySchedule {
  date: string;
  events: ScheduleEvent[];
}

export interface Schedule {
  schedules: DailySchedule[];
}

// Sample schedule data
export const SAMPLE_SCHEDULE: Schedule = {
  schedules: [
    {
      date: "2024-03-19",
      events: [
        {
          id: "1",
          title: "Team Meeting",
          startTime: "2024-03-19T09:00",
          endTime: "2024-03-19T10:00",
          description: "Weekly sync with the team",
        },
        {
          id: "2",
          title: "Lunch",
          startTime: "2024-03-19T12:00",
          endTime: "2024-03-19T13:00",
        },
      ],
    },
    {
      date: "2024-03-20",
      events: [
        {
          id: "3",
          title: "Client Call",
          startTime: "2024-03-20T14:00",
          endTime: "2024-03-20T15:00",
          description: "Project review with client",
        },
      ],
    },
  ],
};

export function Schedule({
  schedule = SAMPLE_SCHEDULE,
  suggestedTime = "",
  isHighlighted = false,
}: {
  schedule?: Schedule;
  suggestedTime?: string;
  isHighlighted?: boolean;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const daysToShow = isMobile ? 2 : 3;

  return (
    <div
      className={cx("flex flex-col gap-4 rounded-2xl p-4 max-w-[500px]", {
        "bg-blue-100 dark:bg-blue-900": !isHighlighted,
        "bg-green-100 dark:bg-green-900": isHighlighted,
      })}
    >
      <div className="flex flex-col gap-4">
        {schedule.schedules.slice(0, daysToShow).map((dailySchedule) => (
          <div key={dailySchedule.date} className="flex flex-col gap-2">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {format(new Date(dailySchedule.date), "EEEE, MMMM d")}
            </div>
            {dailySchedule.events.map((event) => (
              <div
                key={event.id}
                className={cx("flex flex-col p-2 rounded-lg", {
                  "bg-white/50 dark:bg-white/10":
                    !isHighlighted || event.startTime !== suggestedTime,
                  "bg-green-200 dark:bg-green-800":
                    isHighlighted && event.startTime === suggestedTime,
                })}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{event.title}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {format(new Date(event.startTime), "h:mm a")} -{" "}
                    {format(new Date(event.endTime), "h:mm a")}
                  </span>
                </div>
                {event.description && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {event.description}
                  </span>
                )}
              </div>
            ))}
            {dailySchedule.events.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                No events scheduled
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
