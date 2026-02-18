"use client";

import { useState, useCallback, useEffect } from "react";
import { MESSAGE_LIMIT } from "@/lib/constants";

const STORAGE_KEY = "opsis-chat-count";

export function useMessageLimit(sessionId: string) {
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${sessionId}`);
    if (stored) {
      setMessageCount(parseInt(stored, 10));
    }
  }, [sessionId]);

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
