"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/hooks/use-chat";

interface ChatMessageProps {
  message: ChatMessageType;
}

const URL_REGEX = /(https?:\/\/[^\s<>)"',]+)/g;

function linkifyText(text: string) {
  const parts = text.split(URL_REGEX);
  return parts.map((part, i) => {
    if (URL_REGEX.test(part)) {
      URL_REGEX.lastIndex = 0;
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-400 hover:text-blue-300 break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.role === "bot";

  return (
    <div
      className={cn(
        "flex w-full mb-3",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
          isBot
            ? "bg-card/90 text-card-foreground border border-border rounded-bl-sm backdrop-blur-sm"
            : "bg-primary/90 text-primary-foreground rounded-br-sm backdrop-blur-sm"
        )}
      >
        {isBot ? linkifyText(message.content) : message.content}
      </div>
    </div>
  );
}
