import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "./env";

let client: Anthropic | null = null;

/** Shared Anthropic client: 25 s timeout, one SDK retry (429/5xx/network). */
export function anthropic(): Anthropic {
  client ??= new Anthropic({ timeout: 25_000, maxRetries: 1 });
  return client;
}

export function model(): string {
  return env.claudeModel();
}

/**
 * Server-side refusal fallback (opt-in, on by default for Sonnet 5.5): if the
 * model declines in a category the fallback covers, the API retries on the
 * fallback model inside the same call. Set CLAUDE_FALLBACKS=off to disable.
 */
export function fallbackParams(): { betas: string[]; fallbacks: "default" } | Record<string, never> {
  if ((process.env.CLAUDE_FALLBACKS ?? "").toLowerCase() === "off") return {};
  return { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" };
}

export { Anthropic };
