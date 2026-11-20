import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { newConversationId } from "../ids";
import { signToken, verifyToken } from "../tokens";
import type { Lang } from "../types";
import { PROMPT_VERSION } from "./system-prompt";

/**
 * Conversation state kept by the browser, signed by the server (HMAC). The
 * transcript is append-only and stored exactly as the API returned it
 * (including thinking blocks), which keeps prompt caching and Claude's
 * preserved-thinking history check happy. Tampered, expired or
 * old-prompt-version state simply starts a new conversation.
 */
export interface ConversationState {
  v: string;
  model: string;
  cid: string;
  turns: number;
  lang: Lang;
  messages: Anthropic.Beta.BetaMessageParam[];
}

export const STATE_TTL_SECONDS = 24 * 3600;
export const MAX_STATE_BYTES = 300_000;

export function newState(model: string, lang: Lang): ConversationState {
  return { v: PROMPT_VERSION, model, cid: newConversationId(), turns: 0, lang, messages: [] };
}

export function loadState(token: unknown, model: string): { state: ConversationState | null; reason?: "invalid" | "version" } {
  if (token === null || token === undefined || token === "") return { state: null };
  const v = verifyToken<ConversationState>("chat", token);
  if (!v) return { state: null, reason: "invalid" };
  const s = v.data;
  if (s.v !== PROMPT_VERSION || s.model !== model || !Array.isArray(s.messages)) return { state: null, reason: "version" };
  return { state: s };
}

export function saveState(s: ConversationState): string | null {
  const token = signToken("chat", s, STATE_TTL_SECONDS);
  return token.length > MAX_STATE_BYTES ? null : token;
}
