export interface ChatMetadata {
  landlordId?: string | null;
  messageCount: number;
  isLastMessage: boolean;
}

interface ChatPayload {
  action: "sendMessage" | "loadPreviousSession";
  sessionId: string;
  chatInput?: string;
  metadata?: ChatMetadata;
}

interface ChatResponse {
  output: string;
  [key: string]: unknown;
}

export async function sendChatMessage(
  sessionId: string,
  message: string,
  metadata: ChatMetadata
): Promise<string> {
  const payload: ChatPayload = {
    action: "sendMessage",
    sessionId,
    chatInput: message,
    metadata,
  };

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`);
  }

  const data = await res.json();
  return (data.output || data.text || JSON.stringify(data)) as string;
}

export async function loadPreviousSession(
  sessionId: string
): Promise<ChatResponse | null> {
  const payload: ChatPayload = {
    action: "loadPreviousSession",
    sessionId,
  };

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
