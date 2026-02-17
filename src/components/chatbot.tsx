"use client";

import { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { useChat } from "@/hooks/use-chat";
import { MESSAGE_LIMIT } from "@/lib/constants";

export function Chatbot() {
  const { messages, isLoading, sendMessage, canSendMessage, isLimitReached, messageCount } =
    useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <Card className="flex flex-col w-full max-w-2xl mx-auto h-[calc(100vh-2rem)] md:h-[600px] border-border bg-background/80 backdrop-blur-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-card">
        <h2 className="text-sm font-semibold text-foreground">
          Opsis Dalmatia - Tourist Assistant
        </h2>
        <p className="text-xs text-muted-foreground">
          {isLimitReached
            ? "Session complete - Thank you!"
            : `${MESSAGE_LIMIT - messageCount} messages remaining`}
        </p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-1">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-3">
              <div className="bg-card text-card-foreground border border-border rounded-2xl rounded-bl-sm px-4 py-3 text-sm">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce delay-0">.</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <ChatInput
        onSend={sendMessage}
        disabled={!canSendMessage || isLoading}
        placeholder={
          isLimitReached
            ? "Session complete. Thank you for chatting!"
            : "Ask about activities in Split & Dalmatia..."
        }
      />
    </Card>
  );
}
