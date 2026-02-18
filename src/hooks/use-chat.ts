"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { sendChatMessage } from "@/lib/n8n-chat-api";
import { useMessageLimit } from "./use-message-limit";
import { useLandlordId } from "./use-landlord-id";

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

const SESSION_KEY = "opsis-chat-session";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return uuidv4();
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = uuidv4();
  sessionStorage.setItem(SESSION_KEY, id);
  return id;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(getOrCreateSessionId);
  const landlordId = useLandlordId();
  const { messageCount, canSendMessage, isLastMessage, isLimitReached, incrementCount, resetCount } =
    useMessageLimit(sessionId);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (messages.length === 0) {
      const greeting: ChatMessage = {
        id: uuidv4(),
        role: "bot",
        content:
          "Welcome! I'm your personal tourist assistant for Split and Dalmatia. How can I help you plan your activities today?",
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [messages.length]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !canSendMessage || isLoading) return;

      const userMsg: ChatMessage = {
        id: uuidv4(),
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const response = await sendChatMessage(sessionId, text.trim(), {
          landlordId,
          messageCount: messageCount + 1,
          isLastMessage,
        });

        incrementCount();

        const botMsg: ChatMessage = {
          id: uuidv4(),
          role: "bot",
          content: response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        const errorMsg: ChatMessage = {
          id: uuidv4(),
          role: "bot",
          content:
            "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [canSendMessage, isLoading, sessionId, landlordId, messageCount, isLastMessage, incrementCount]
  );

  const cleanup = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    canSendMessage,
    isLimitReached,
    messageCount,
    resetCount,
    cleanup,
  };
}
