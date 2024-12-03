"use client";

import type { Message } from "ai";
import { useChat } from "ai/react";

import { PreviewMessage, ThinkingMessage } from "@/components/message";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";

import { MultimodalInput } from "@/components/multimodal-input";
import { Overview } from "@/components/overview";

export function Chat({
  id,
  initialMessages,
  selectedModelId,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
}) {
  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
  } = useChat({
    body: { id, modelId: selectedModelId },
    initialMessages,
  });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const handleSchedule = async (eventDetails: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    attendees: string[];
  }) => {
    await append({
      role: "user",
      content: `Please schedule a meeting titled "${eventDetails.title}" from ${
        eventDetails.startTime
      } to ${eventDetails.endTime}${
        eventDetails.description
          ? ` with description: ${eventDetails.description}`
          : ""
      }${
        eventDetails.attendees.length > 0
          ? ` and attendees: ${eventDetails.attendees.join(", ")}`
          : ""
      }`,
    });
  };

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <div
          ref={messagesContainerRef}
          className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
        >
          {messages.length === 0 && <Overview />}

          {messages.map((message, index) => (
            <PreviewMessage
              key={message.id}
              chatId={id}
              message={message}
              isLoading={isLoading && messages.length - 1 === index}
              onSchedule={handleSchedule}
            />
          ))}

          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <ThinkingMessage />
            )}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>
        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          <MultimodalInput
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            messages={messages}
            setMessages={setMessages}
            append={append}
          />
        </form>
      </div>
    </>
  );
}
