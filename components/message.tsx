"use client";

import type { Message } from "ai";
import cx from "classnames";
import { motion } from "framer-motion";

import { SparklesIcon } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { Schedule } from "@/components/schedule";
import { ScheduleSuggestion } from "@/components/schedule-suggestion";

// Component to display today's date nicely
const TodayDisplay = ({
  date,
  dayOfWeek,
  formatted,
}: {
  date: string;
  dayOfWeek: string;
  formatted: string;
}) => (
  <div className="flex flex-col gap-1 p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
    <div className="text-lg font-medium">{formatted}</div>
    <div className="text-sm text-gray-600 dark:text-gray-300">{dayOfWeek}</div>
  </div>
);

export const PreviewMessage = ({
  chatId,
  message,
  isLoading,
  onSchedule,
}: {
  chatId: string;
  message: Message;
  isLoading: boolean;
  onSchedule?: (eventDetails: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    attendees: string[];
  }) => void;
}) => {
  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={message.role}
    >
      <div
        className={cx(
          "group-data-[role=user]/message:bg-primary group-data-[role=user]/message:text-primary-foreground flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl"
        )}
      >
        {message.role === "assistant" && (
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
            <SparklesIcon size={14} />
          </div>
        )}

        <div className="flex flex-col gap-2 w-full">
          {message.content && (
            <div className="flex flex-col gap-4">
              <Markdown>{message.content as string}</Markdown>
            </div>
          )}

          {message.toolInvocations && message.toolInvocations.length > 0 && (
            <div className="flex flex-col gap-4">
              {message.toolInvocations.map((toolInvocation) => {
                const { toolName, toolCallId, state, args } = toolInvocation;

                if (state === "result") {
                  const { result } = toolInvocation;

                  return (
                    <div key={toolCallId}>
                      {toolName === "getSchedule" ? (
                        <Schedule schedule={result} />
                      ) : toolName === "suggestTime" ? (
                        <ScheduleSuggestion
                          schedule={result.schedule}
                          suggestedTime={result.suggestedTime}
                          message={result.message}
                          duration={result.duration}
                          onSchedule={onSchedule}
                        />
                      ) : toolName === "addEvent" ? (
                        <Schedule
                          schedule={result.schedule}
                          isHighlighted={result.success}
                        />
                      ) : toolName === "getToday" ? (
                        <TodayDisplay {...result} />
                      ) : (
                        <pre>{JSON.stringify(result, null, 2)}</pre>
                      )}
                    </div>
                  );
                }
                return (
                  <div
                    key={toolCallId}
                    className={cx({
                      skeleton: [
                        "getSchedule",
                        "suggestTime",
                        "getToday",
                        "addEvent",
                      ].includes(toolName),
                    })}
                  >
                    {["getSchedule", "suggestTime", "addEvent"].includes(
                      toolName
                    ) ? (
                      <Schedule />
                    ) : toolName === "getToday" ? (
                      <TodayDisplay
                        date=""
                        dayOfWeek="Loading..."
                        formatted="Loading..."
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          }
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
