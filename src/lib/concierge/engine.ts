import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { anthropic, fallbackParams, model } from "../claude";
import { env } from "../env";
import { logEvent } from "../repo";
import { AREAS } from "../taxonomy";
import type { Lang, UIBlock } from "../types";
import { zagrebNow } from "../zagreb-time";
import { loadState, newState, saveState, type ConversationState } from "./state";
import { SYSTEM_PROMPT } from "./system-prompt";
import { runTool, TOOLS, type ToolContext } from "./tools";

const MAX_MODEL_CALLS = 5;

export interface TurnInput {
  stateToken: unknown;
  message: string;
  lang: Lang;
  area: string | null;
  at: Date;
}

export interface TurnOutput {
  blocks: UIBlock[];
  state: string | null;
  remaining: number;
  reset?: boolean;
  code?: "limit" | "busy" | "refusal" | "disabled" | "error";
}

const COPY = {
  en: {
    limit: "We've reached the message limit for this chat. You can still browse and book with the buttons, or start a new chat.",
    busy: "I'm a bit overloaded right now. Please try again in a moment — the menu buttons keep working meanwhile.",
    refusal: "Sorry, I can't help with that one. I'm happy to help with tours, activities and bookings in Split and Dalmatia.",
    disabled: "The AI chat is paused right now. You can still browse and book everything with the buttons.",
    error: "Something went wrong on our side. Please try again, or use the menu buttons to browse and book.",
    long: "This chat got long, so I've started a fresh one. Tell me again what you're looking for.",
  },
  hr: {
    limit: "Dosegnuli smo ograničenje poruka za ovaj razgovor. I dalje možete pregledavati i rezervirati gumbima ili započeti novi razgovor.",
    busy: "Trenutno sam preopterećen. Pokušajte ponovno za trenutak, a gumbi izbornika rade i dalje.",
    refusal: "Nažalost, s tim ne mogu pomoći. Rado pomažem oko izleta, aktivnosti i rezervacija u Splitu i Dalmaciji.",
    disabled: "AI chat je trenutno pauziran. Sve možete pregledati i rezervirati gumbima.",
    error: "Nešto je pošlo po zlu kod nas. Pokušajte ponovno ili koristite gumbe izbornika.",
    long: "Razgovor je postao predug pa sam započeo novi. Recite mi ponovno što tražite.",
  },
};

function contextBlock(lang: Lang, area: string | null, at: Date): string {
  const z = zagrebNow(at);
  const time = `${String(z.hour).padStart(2, "0")}:${String(z.minute).padStart(2, "0")}`;
  const where = area && AREAS[area] ? AREAS[area].label : "not specified";
  return `[Context from the system]\nNow in Split: ${z.weekday} ${z.date}, ${time} (Europe/Zagreb)\nInterface language: ${lang === "hr" ? "Croatian" : "English"}\nGuest is staying in: ${where}`;
}

function textOf(content: Anthropic.Beta.BetaContentBlock[]): string {
  return content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n\n")
    .trim();
}

function mergeText(blocks: UIBlock[]): UIBlock[] {
  const out: UIBlock[] = [];
  for (const b of blocks) {
    const last = out[out.length - 1];
    if (b.type === "text" && last?.type === "text") last.text = `${last.text}\n\n${b.text}`.trim();
    else if (b.type !== "text" || b.text.trim()) out.push(b);
  }
  return out;
}

export async function runTurn(input: TurnInput): Promise<TurnOutput> {
  const copy = COPY[input.lang];
  const maxTurns = env.chatMaxTurns();
  if (!env.chatEnabled() || !env.hasAnthropicKey()) {
    return { blocks: [{ type: "notice", text: copy.disabled }], state: null, remaining: 0, code: "disabled" };
  }

  const modelId = model();
  const loaded = loadState(input.stateToken, modelId);
  const reset = !!loaded.reason;
  const state: ConversationState = loaded.state ?? newState(modelId, input.lang);

  if (state.turns >= maxTurns) {
    return { blocks: [{ type: "notice", text: copy.limit }], state: saveState(state), remaining: 0, code: "limit" };
  }

  // Work on a copy; the stored transcript only changes if the turn succeeds.
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    ...state.messages,
    {
      role: "user",
      content: [
        { type: "text", text: contextBlock(input.lang, input.area, input.at) },
        { type: "text", text: input.message },
      ],
    },
  ];
  const ui: UIBlock[] = [];
  const ctx: ToolContext = { lang: input.lang, area: input.area, at: input.at };
  let usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };

  try {
    for (let call = 1; call <= MAX_MODEL_CALLS; call++) {
      const response = await anthropic().beta.messages.create({
        model: modelId,
        max_tokens: 4096,
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        tools: TOOLS,
        messages,
        output_config: { effort: "low" },
        cache_control: { type: "ephemeral" },
        ...fallbackParams(),
      });
      usage = {
        input: usage.input + (response.usage.input_tokens ?? 0),
        output: usage.output + (response.usage.output_tokens ?? 0),
        cacheRead: usage.cacheRead + (response.usage.cache_read_input_tokens ?? 0),
        cacheWrite: usage.cacheWrite + (response.usage.cache_creation_input_tokens ?? 0),
      };

      if (response.stop_reason === "refusal") {
        await logEvent("warn", "chat_refusal", state.cid, String(response.stop_details?.category ?? ""));
        state.turns += 1; // counts toward the cap, transcript unchanged
        return { blocks: [{ type: "text", text: copy.refusal }], state: saveState(state), remaining: maxTurns - state.turns, reset, code: "refusal" };
      }

      messages.push({ role: "assistant", content: response.content });
      const text = textOf(response.content);
      if (text) ui.push({ type: "text", text });

      if (response.stop_reason !== "tool_use") break;

      const toolUses = response.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
      const outcomes = await Promise.all(toolUses.map((t) => runTool(t.name, t.input, ctx)));
      const lastCall = call === MAX_MODEL_CALLS;
      messages.push({
        role: "user",
        content: toolUses.map((t, i) => ({
          type: "tool_result" as const,
          tool_use_id: t.id,
          content: lastCall ? JSON.stringify({ error: "tool_budget_reached_for_this_message" }) : outcomes[i].content,
          ...(outcomes[i].isError || lastCall ? { is_error: true } : {}),
        })),
      });
      if (!lastCall) for (const o of outcomes) if (o.ui) ui.push(o.ui);
      if (lastCall) {
        // History stays valid (every tool_use has a result); answer generically.
        ui.push({ type: "text", text: input.lang === "hr" ? "Evo što sam našao. Recite mi koja vam se opcija sviđa." : "Here's what I found. Tell me which option you like." });
      }
    }
  } catch (err) {
    const busy =
      err instanceof Anthropic.RateLimitError ||
      err instanceof Anthropic.APIConnectionError ||
      err instanceof Anthropic.InternalServerError ||
      (err instanceof Anthropic.APIError && (err.status === 529 || err.status === 503));
    await logEvent("error", busy ? "chat_busy" : "chat_error", state.cid, `${(err as Error).name}: ${(err as Error).message}`.slice(0, 280));
    return { blocks: [{ type: "notice", text: busy ? copy.busy : copy.error, tone: "warn" }], state: saveState(state), remaining: maxTurns - state.turns, reset, code: busy ? "busy" : "error" };
  }

  state.messages = messages;
  state.turns += 1;
  state.lang = input.lang;
  let token = saveState(state);
  const blocks = mergeText(ui);
  if (!token) {
    blocks.push({ type: "notice", text: copy.long });
    token = null;
  }
  console.log("[chat] turn", { cid: state.cid, turns: state.turns, ...usage });
  return { blocks, state: token, remaining: maxTurns - state.turns, reset };
}
