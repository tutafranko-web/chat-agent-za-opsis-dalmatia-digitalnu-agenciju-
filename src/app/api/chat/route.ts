import { NextRequest, NextResponse } from "next/server";

const N8N_URL = process.env.N8N_CHAT_WEBHOOK_URL || "";
const N8N_AUTH = process.env.N8N_WEBHOOK_AUTH || "";
const N8N_OPSIS_KEY = process.env.N8N_OPSIS_KEY || "";

// --- Rate Limiter (in-memory, per session + per IP) ---
const sessionBucket = new Map<string, { count: number; resetAt: number }>();
const ipBucket = new Map<string, { count: number; resetAt: number }>();

const SESSION_RATE_LIMIT = 3; // max 3 messages per window per session
const SESSION_RATE_WINDOW = 10_000; // 10 seconds
const IP_RATE_LIMIT = 60; // max 60 messages per window per IP
const IP_RATE_WINDOW = 3_600_000; // 1 hour

// Cleanup stale entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of sessionBucket) {
    if (now > val.resetAt) sessionBucket.delete(key);
  }
  for (const [key, val] of ipBucket) {
    if (now > val.resetAt) ipBucket.delete(key);
  }
}, 300_000);

function isRateLimited(key: string, bucket: Map<string, { count: number; resetAt: number }>, limit: number, window: number): boolean {
  const now = Date.now();
  const entry = bucket.get(key);
  if (!entry || now > entry.resetAt) {
    bucket.set(key, { count: 1, resetAt: now + window });
    return false;
  }
  entry.count++;
  return entry.count > limit;
}

export async function POST(req: NextRequest) {
  if (!N8N_URL) {
    return NextResponse.json({ output: "Chatbot configuration error. Please contact support." }, { status: 200 });
  }

  // --- Parse body safely ---
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ output: "Invalid request." }, { status: 400 });
  }

  // --- Validate required fields ---
  if (!body.sessionId || !body.action) {
    return NextResponse.json({ output: "Invalid request." }, { status: 400 });
  }

  // --- Rate limit checks ---
  const sessionId = (body.sessionId as string) || "unknown";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

  if (isRateLimited(sessionId, sessionBucket, SESSION_RATE_LIMIT, SESSION_RATE_WINDOW)) {
    return NextResponse.json(
      { output: "You're sending messages too quickly. Please wait a few seconds and try again." },
      { status: 200 }
    );
  }
  if (isRateLimited(ip, ipBucket, IP_RATE_LIMIT, IP_RATE_WINDOW)) {
    return NextResponse.json(
      { output: "Too many requests. Please try again later." },
      { status: 200 }
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (N8N_AUTH) {
    headers["Authorization"] = `Basic ${N8N_AUTH}`;
  }
  if (N8N_OPSIS_KEY) {
    headers["x-opsis-key"] = N8N_OPSIS_KEY;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

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
