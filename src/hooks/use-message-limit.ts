"use client";

import { useState, useCallback } from "react";
import { MESSAGE_LIMIT } from "@/lib/constants";

const STORAGE_KEY = "opsis-chat-count";

function getStoredCount(sessionId: string): number {
  if (!sessionId || typeof window === "undefined") return 0;
  const stored = localStorage.getItem(`${STORAGE_KEY}-${sessionId}`);
  return stored ? parseInt(stored, 10) : 0;
}

export function useMessageLimit(sessionId: string) {
  const [messageCount, setMessageCount] = useState(() => getStoredCount(sessionId));

  const incrementCount = useCallback(() => {
    setMessageCount((prev) => {
      const next = prev + 1;
      localStorage.setItem(`${STORAGE_KEY}-${sessionId}`, String(next));
      return next;
    });
  }, [sessionId]);

  const resetCount = useCallback(() => {
    localStorage.removeItem(`${STORAGE_KEY}-${sessionId}`);
    setMessageCount(0);
  }, [sessionId]);

  const canSendMessage = messageCount < MESSAGE_LIMIT;
  const isLastMessage = messageCount === MESSAGE_LIMIT - 1;
  const isLimitReached = messageCount >= MESSAGE_LIMIT;

  return { messageCount, canSendMessage, isLastMessage, isLimitReached, incrementCount, resetCount };
}
