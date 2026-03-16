"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/hooks/use-chat";

interface ChatMessageProps {
  message: ChatMessageType;
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
        {message.content}
      </div>
    </div>
  );
}
