import { NextRequest, NextResponse } from "next/server";

const N8N_URL = process.env.N8N_CHAT_WEBHOOK_URL || "";
const N8N_AUTH = process.env.N8N_WEBHOOK_AUTH || "";

export async function POST(req: NextRequest) {
  if (!N8N_URL) {
    return NextResponse.json({ output: "Chatbot configuration error. Please contact support." }, { status: 200 });
  }

  const body = await req.json();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (N8N_AUTH) {
    headers["Authorization"] = `Basic ${N8N_AUTH}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(N8N_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    clearTimeout(timeoutId);
    return NextResponse.json(
      { output: "I'm sorry, the request timed out. Please try again in a moment." },
      { status: 200 }
    );
  }
}
