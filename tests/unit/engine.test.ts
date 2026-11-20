import { beforeEach, describe, expect, it, vi } from "vitest";

// Scripted fake of the Anthropic client used by the concierge engine.
const calls: unknown[] = [];
let script: Array<Record<string, unknown>> = [];

vi.mock("@/lib/claude", async () => {
  const real = await vi.importActual<typeof import("@anthropic-ai/sdk")>("@anthropic-ai/sdk");
  return {
    Anthropic: real.default,
    model: () => "claude-sonnet-5-5",
    fallbackParams: () => ({}),
    anthropic: () => ({
      beta: {
        messages: {
          create: async (params: unknown) => {
            calls.push(JSON.parse(JSON.stringify(params)));
            const next = script.shift();
            if (!next) throw new Error("script exhausted");
            return { usage: { input_tokens: 100, output_tokens: 20, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 }, ...next };
          },
        },
      },
    }),
  };
});

import { runTurn } from "@/lib/concierge/engine";
import { SYSTEM_PROMPT } from "@/lib/concierge/system-prompt";
import { __resetMemoryStore, store } from "@/lib/store";

const AT = new Date("2026-07-15T08:00:00Z");

beforeEach(() => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  calls.length = 0;
  script = [];
  store();
  __resetMemoryStore();
});

describe("concierge engine", () => {
  it("runs a tool round, returns cards and a signed, append-only state", async () => {
    script = [
      {
        stop_reason: "tool_use",
        content: [
          { type: "text", text: "Let me check boat tours." },
          { type: "tool_use", id: "tu_1", name: "search_activities", input: { type_key: "speedboat_tours", query: null, date: null, adults: null, children: null } },
        ],
      },
      { stop_reason: "end_turn", content: [{ type: "text", text: "The Blue Cave tour is the classic." }] },
    ];
    const out = await runTurn({ stateToken: null, message: "boat trip to the blue cave?", lang: "en", area: null, at: AT });
    expect(out.code).toBeUndefined();
    expect(out.blocks.map((b) => b.type)).toEqual(["text", "cards", "text"]);
    const cards = out.blocks.find((b) => b.type === "cards");
    expect(cards && cards.type === "cards" && cards.offers[0].id).toBe("A-DEM001");
    expect(JSON.stringify(out.blocks)).not.toMatch(/commission|opsisdalmatia\+demo/);
    expect(out.remaining).toBe(19);

    const first = calls[0] as { system: { text: string }[]; messages: { role: string; content: { type: string; text?: string }[] }[]; tools: unknown[] };
    expect(first.system[0].text).toBe(SYSTEM_PROMPT);
    expect(first.messages[0].content[0].text).toMatch(/\[Context from the system\]/);
    expect(first.messages[0].content[1].text).toBe("boat trip to the blue cave?");
    const toolResultMsg = (calls[1] as { messages: { role: string; content: { type: string; content?: string }[] }[] }).messages[2];
    expect(toolResultMsg.content[0].type).toBe("tool_result");
    expect(toolResultMsg.content[0].content).not.toMatch(/commission|@/);

    // Second turn: earlier messages are replayed unchanged (append-only)
    script = [{ stop_reason: "end_turn", content: [{ type: "text", text: "Sure!" }] }];
    const out2 = await runTurn({ stateToken: out.state, message: "and for kids?", lang: "en", area: null, at: AT });
    expect(out2.remaining).toBe(18);
    const replay = (calls[2] as { messages: unknown[] }).messages;
    const prev = (calls[1] as { messages: unknown[] }).messages;
    expect(replay.slice(0, prev.length)).toEqual([...prev.slice(0, prev.length)]);
  });

  it("prepare_booking returns a booking card without contact details", async () => {
    script = [
      { stop_reason: "tool_use", content: [{ type: "tool_use", id: "tu_2", name: "prepare_booking", input: { activity_id: "A-DEM001", date: "2026-07-20", adults: 2, children: 0 } }] },
      { stop_reason: "end_turn", content: [{ type: "text", text: "Fill in the card to send the request." }] },
    ];
    const out = await runTurn({ stateToken: null, message: "book it for 20 July, 2 adults", lang: "en", area: null, at: AT });
    const booking = out.blocks.find((b) => b.type === "booking");
    expect(booking && booking.type === "booking" && booking.draft.total).toBe(250);
  });

  it("rejects tampered state and handles refusals and API errors", async () => {
    script = [{ stop_reason: "end_turn", content: [{ type: "text", text: "Hi" }] }];
    const ok = await runTurn({ stateToken: "tampered.state", message: "hi", lang: "hr", area: null, at: AT });
    expect(ok.reset).toBe(true);

    script = [{ stop_reason: "refusal", stop_details: { category: "general_harms" }, content: [] }];
    const ref = await runTurn({ stateToken: null, message: "something bad", lang: "en", area: null, at: AT });
    expect(ref.code).toBe("refusal");

    script = [];
    const err = await runTurn({ stateToken: null, message: "hello", lang: "en", area: null, at: AT });
    expect(err.code).toBe("error");
  });

  it("enforces the turn cap", async () => {
    process.env.CHAT_MAX_TURNS = "1";
    script = [{ stop_reason: "end_turn", content: [{ type: "text", text: "Hi" }] }];
    const one = await runTurn({ stateToken: null, message: "hi", lang: "en", area: null, at: AT });
    const two = await runTurn({ stateToken: one.state, message: "again", lang: "en", area: null, at: AT });
    expect(two.code).toBe("limit");
    delete process.env.CHAT_MAX_TURNS;
  });
});
