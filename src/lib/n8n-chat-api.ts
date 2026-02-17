import { N8N_CHAT_WEBHOOK_URL, N8N_WEBHOOK_AUTH } from "./constants";

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

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (N8N_WEBHOOK_AUTH) {
    headers["Authorization"] = `Basic ${N8N_WEBHOOK_AUTH}`;
  }

  const res = await fetch(N8N_CHAT_WEBHOOK_URL, {
    method: "POST",
    headers,
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
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (N8N_WEBHOOK_AUTH) {
      headers["Authorization"] = `Basic ${N8N_WEBHOOK_AUTH}`;
    }

    const res = await fetch(N8N_CHAT_WEBHOOK_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
