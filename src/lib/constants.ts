export const N8N_CHAT_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL || "";

export const MESSAGE_LIMIT = parseInt(
  process.env.NEXT_PUBLIC_MESSAGE_LIMIT || "15",
  10
);
