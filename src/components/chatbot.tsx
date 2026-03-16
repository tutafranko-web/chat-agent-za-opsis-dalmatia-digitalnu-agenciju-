"use client";

import { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { useChat } from "@/hooks/use-chat";
import { MESSAGE_LIMIT } from "@/lib/constants";
import { BackgroundPaths } from "@/components/ui/background-paths";

export function Chatbot() {
  const { messages, isLoading, sendMessage, canSendMessage, isLimitReached, messageCount, resetSession } =
    useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <Card className="relative flex flex-col w-full max-w-2xl mx-auto h-[calc(100vh-2rem)] md:h-[600px] border-border bg-background/80 backdrop-blur-sm overflow-hidden">
      {/* Animated background paths */}
      <BackgroundPaths />

      {/* Header */}
      <div className="relative z-10 px-4 py-3 border-b border-border bg-card/90 backdrop-blur-sm">
        <h2 className="text-sm font-semibold text-foreground">
          Opsis Dalmatia — AI Concierge
        </h2>
        <p className="text-xs text-muted-foreground">
          {isLimitReached ? (
            <button
              onClick={resetSession}
              className="underline hover:no-underline cursor-pointer"
              aria-label="Start new chat session"
            >
              Session complete — Start new session
            </button>
          ) : (
            `${MESSAGE_LIMIT - messageCount} messages remaining`
          )}
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="relative z-10 flex-1 min-h-0 overflow-y-auto p-4" role="log" aria-live="polite" aria-label="Chat messages">
        <div className="space-y-1">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-3">
              <div className="bg-card/90 text-card-foreground border border-border rounded-2xl rounded-bl-sm px-4 py-3 text-sm backdrop-blur-sm">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce delay-0">.</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="relative z-10">
        <ChatInput
          onSend={sendMessage}
          disabled={!canSendMessage || isLoading}
          placeholder={
            isLimitReached
              ? "Session complete. Thank you for chatting!"
              : "Ask about activities in Split & Dalmatia..."
          }
        />
      </div>
    </Card>
  );
}
