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

const GREETING = `Welcome to Opsis Dalmatia! 🌊
Your personal activity concierge for the Split & Dalmatia region.

Choose a category (type the number):

━━━━━━━━━━━━━━━━━━━━━━━
1️⃣  Nautical & Water Activities
2️⃣  Adrenaline & Adventure 🏍️
3️⃣  Transportation Rentals
4️⃣  Land Tours & Guided Experiences
5️⃣  Nightlife & Entertainment
6️⃣  Quiz Results (paste your quiz score)
7️⃣  Show All Activities
━━━━━━━━━━━━━━━━━━━━━━━

Type a number → see specific activities → pick one to book! 👇
You have 15 messages. I speak all languages.`;

export function useChat() {
  // Start with empty string — populated in useEffect (client-only)
  // This avoids SSR/client hydration mismatch from sessionStorage access
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const landlordId = useLandlordId();
  const { messageCount, canSendMessage, isLastMessage, isLimitReached, incrementCount, resetCount } =
    useMessageLimit(sessionId);
  const abortRef = useRef<AbortController | null>(null);

  // Initialize session ID on client only (avoids SSR mismatch)
  useEffect(() => {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) {
      setSessionId(existing);
    } else {
      const id = uuidv4();
      sessionStorage.setItem(SESSION_KEY, id);
      setSessionId(id);
    }
  }, []);

  // Show greeting once on mount
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: ChatMessage = {
        id: uuidv4(),
        role: "bot",
        content: GREETING,
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [messages.length]);

  const sendMessage = useCallback(
    async (text: string) => {
      // Don't send if no session yet, no text, limit reached, or already loading
      if (!sessionId || !text.trim() || !canSendMessage || isLoading) return;

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
      } catch {
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
    [sessionId, canSendMessage, isLoading, landlordId, messageCount, isLastMessage, incrementCount]
  );

  const resetSession = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    resetCount();
    window.location.reload();
  }, [resetCount]);

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
    resetSession,
    cleanup,
  };
}
