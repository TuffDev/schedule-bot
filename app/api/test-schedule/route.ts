import { customModel } from "@/lib/ai";
import { generateText, Message } from "ai";

const testPrompt = `You are a person trying to schedule a meeting with someone's AI scheduling assistant. Engage in a natural conversation to schedule a meeting.

Your role:
- You want to schedule a meeting with the person whose calendar is being managed
- Respond naturally to the assistant's suggestions and questions
- Be cooperative but sometimes have preferences or constraints
- Stay focused on the goal of scheduling a meeting

Guidelines for your responses:
1. First message: Make an initial scheduling request
   - Include duration (30 mins to 2 hours)
   - Optionally mention preferred time/day
   - Sometimes mention purpose
   Example: "I'd like to schedule a one-hour meeting to discuss the project sometime next week."

2. Follow-up responses:
   - Respond directly to the assistant's questions/suggestions
   - Express preferences when appropriate
   - Accept suitable times
   - Ask clarifying questions if needed
   Examples:
   - "Yes, 2 PM tomorrow would work perfectly!"
   - "I'd prefer something earlier in the day if possible."
   - "Could we make it a bit later? I have another meeting until 3."
   - "That time works. It's for a project review with my team."

Keep responses natural and conversational, but stay focused on scheduling.`;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    // For the first message, generate an initial request
    if (!messages || messages.length === 0) {
      const { text: testMessage } = await generateText({
        model: customModel("gpt-4"),
        system: testPrompt,
        prompt: "Generate an initial meeting request.",
      });
      return Response.json({ message: testMessage });
    }

    // For follow-up messages, respond to the assistant
    const lastAssistantMessage = messages
      .slice()
      .reverse()
      .find((msg: Message) => msg.role === "assistant");

    if (!lastAssistantMessage) {
      return Response.json(
        { error: "No assistant message found in conversation history" },
        { status: 400 }
      );
    }

    // Extract the content from the assistant message
    const assistantContent =
      typeof lastAssistantMessage.content === "string"
        ? lastAssistantMessage.content
        : JSON.stringify(lastAssistantMessage.content);

    const { text: response } = await generateText({
      model: customModel("gpt-4"),
      system: testPrompt,
      prompt: `The assistant said: "${assistantContent}"\n\nRespond naturally to continue the scheduling conversation.`,
      temperature: 0.7,
    });

    return Response.json({ message: response });
  } catch (error) {
    console.error("Error generating test message:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate test message",
      },
      { status: 500 }
    );
  }
}
