import {
  type Message,
  StreamData,
  convertToCoreMessages,
  streamText,
} from "ai";
import { z } from "zod";
import { format } from "date-fns";
import twilio from "twilio";

import { customModel } from "@/lib/ai";
import { models } from "@/lib/ai/models";
import { systemPrompt } from "@/lib/ai/prompts";
import { getMostRecentUserMessage } from "@/lib/utils";
import {
  getUserSchedule,
  findAvailableSlots,
  addEventToSchedule,
} from "@/lib/schedule";

export const maxDuration = 60;

type AllowedTools = "getSchedule" | "suggestTime" | "getToday" | "addEvent";

const scheduleTools: AllowedTools[] = [
  "getSchedule",
  "suggestTime",
  "getToday",
  "addEvent",
];
const allTools: AllowedTools[] = [...scheduleTools];

const client =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const NOTIFICATION_PHONE_NUMBER = process.env.NOTIFICATION_PHONE_NUMBER;

export async function POST(request: Request) {
  const { messages, modelId }: { messages: Array<Message>; modelId: string } =
    await request.json();

  const model = models.find((model) => model.id === modelId);

  if (!model) {
    return new Response("Model not found", { status: 404 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  const streamingData = new StreamData();

  const result = await streamText({
    model: customModel(model.apiIdentifier),
    system: systemPrompt,
    messages: coreMessages,
    maxSteps: 5,
    experimental_activeTools: allTools,
    tools: {
      getToday: {
        description: "Get today's date in YYYY-MM-DD format",
        parameters: z.object({}),
        execute: async () => {
          return {
            date: format(new Date(), "yyyy-MM-dd"),
            dayOfWeek: format(new Date(), "EEEE"),
            formatted: format(new Date(), "MMMM d, yyyy"),
          };
        },
      },
      getSchedule: {
        description:
          "Get the managed person's schedule for a specified date range",
        parameters: z.object({
          startDate: z
            .string()
            .optional()
            .describe(
              "Start date in YYYY-MM-DD format. Defaults to today if not provided."
            ),
          days: z
            .number()
            .optional()
            .describe(
              "Number of days to fetch. Defaults to 5 if not provided."
            ),
        }),
        execute: async ({ startDate, days }) => {
          return getUserSchedule(
            startDate ? new Date(startDate) : new Date(),
            days || 5
          );
        },
      },
      suggestTime: {
        description:
          "Find available time slots for a meeting with the managed person",
        parameters: z.object({
          date: z
            .string()
            .describe(
              "The date to check for available slots (YYYY-MM-DD format)"
            ),
          duration: z.number().describe("Duration of the meeting in minutes"),
          startHour: z
            .number()
            .optional()
            .describe("Start of working hours (0-23). Defaults to 9."),
          endHour: z
            .number()
            .optional()
            .describe("End of working hours (0-23). Defaults to 17."),
        }),
        execute: async ({ date, duration, startHour, endHour }) => {
          const availableSlots = findAvailableSlots(
            new Date(date),
            duration,
            startHour,
            endHour
          );

          // If no slots are available, return appropriate message
          if (!availableSlots.length) {
            return {
              schedule: getUserSchedule(new Date(date), 1),
              suggestedTime: null,
              message:
                "No available slots found for the specified duration on this date.",
              duration,
            };
          }

          // Return the first available slot as the suggestion
          const suggestedSlot = availableSlots[0];

          return {
            schedule: getUserSchedule(new Date(date), 1),
            suggestedTime: suggestedSlot.startTime,
            message: `I found an available slot at ${
              suggestedSlot.startTime.split("T")[1]
            } for ${duration} minutes.`,
            duration,
          };
        },
      },
      addEvent: {
        description: "Add a new event to the managed person's schedule",
        parameters: z.object({
          title: z.string().describe("Title of the event"),
          startTime: z
            .string()
            .describe("Start time in ISO format (YYYY-MM-DDTHH:mm)"),
          endTime: z
            .string()
            .describe("End time in ISO format (YYYY-MM-DDTHH:mm)"),
          description: z
            .string()
            .optional()
            .describe("Optional description of the event"),
          attendees: z
            .array(z.string())
            .optional()
            .describe("Optional list of attendee email addresses"),
        }),
        execute: async ({
          title,
          startTime,
          endTime,
          description,
          attendees,
        }) => {
          const result = addEventToSchedule(
            title,
            startTime,
            endTime,
            description,
            attendees
          );

          if (!result.success) {
            return {
              success: false,
              error: result.error,
              schedule: getUserSchedule(new Date(startTime), 1),
            };
          }

          // Send SMS notification if configured
          if (NOTIFICATION_PHONE_NUMBER && client) {
            try {
              const message = `New event scheduled: ${title} on ${
                startTime.split("T")[0]
              } at ${startTime.split("T")[1]}${
                description ? `\nDescription: ${description}` : ""
              }${
                attendees?.length > 0
                  ? `\nAttendees: ${attendees.join(", ")}`
                  : ""
              }`;

              await client.messages.create({
                body: message,
                to: NOTIFICATION_PHONE_NUMBER,
                from: process.env.TWILIO_PHONE_NUMBER,
              });
            } catch (error) {
              console.error("Failed to send SMS notification:", error);
              // Continue even if SMS fails - don't block the event creation
            }
          }

          return {
            success: true,
            event: result.event,
            schedule: getUserSchedule(new Date(startTime), 1),
            message: `Successfully scheduled "${title}" from ${
              startTime.split("T")[1]
            } to ${endTime.split("T")[1]} and sent a text message to our team.`,
          };
        },
      },
    },
    onFinish: async () => {
      streamingData.close();
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({
    data: streamingData,
  });
}
