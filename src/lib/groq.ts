const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Abort signal (timeouts) */
  signal?: AbortSignal;
}

export async function chatCompletion(messages: GroqMessage[], opts: GroqOptions = {}): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY env var is missing");

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model ?? DEFAULT_MODEL,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 2048,
    }),
    signal: opts.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Groq API ${res.status}: ${text.slice(0, 500)}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}
