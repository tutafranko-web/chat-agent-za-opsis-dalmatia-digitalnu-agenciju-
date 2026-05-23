import { NextRequest, NextResponse } from "next/server";
import { handleChatTurn } from "@/lib/chat-engine";

export const runtime = "nodejs";
export const maxDuration = 60;

// ── Rate Limiter (in-memory, per session + per IP) ─────────────────────────
const sessionBucket = new Map<string, { count: number; resetAt: number }>();
const ipBucket = new Map<string, { count: number; resetAt: number }>();

const SESSION_RATE_LIMIT = 3;
const SESSION_RATE_WINDOW = 10_000;
const IP_RATE_LIMIT = 60;
const IP_RATE_WINDOW = 3_600_000;
const SERVER_MESSAGE_CAP = 15;

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of sessionBucket) if (now > v.resetAt) sessionBucket.delete(k);
  for (const [k, v] of ipBucket) if (now > v.resetAt) ipBucket.delete(k);
}, 300_000);

function bumpRate(key: string, bucket: Map<string, { count: number; resetAt: number }>, limit: number, window: number): boolean {
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
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ output: "Invalid request." }, { status: 400 });
  }

  if (!body.sessionId || !body.action) {
    return NextResponse.json({ output: "Invalid request." }, { status: 400 });
  }

  const sessionId = String(body.sessionId);
  const action = String(body.action);

  if (action === "loadPreviousSession") {
    // Sessions are in-memory and ephemeral — we don't persist transcript reads.
    return NextResponse.json({ output: "" });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

  if (bumpRate(sessionId, sessionBucket, SESSION_RATE_LIMIT, SESSION_RATE_WINDOW)) {
    return NextResponse.json({ output: "You're sending messages too quickly. Please wait a few seconds and try again." });
  }
  if (bumpRate(ip, ipBucket, IP_RATE_LIMIT, IP_RATE_WINDOW)) {
    return NextResponse.json({ output: "Too many requests. Please try again later." });
  }

  const metadata = (body.metadata as Record<string, unknown> | undefined) || {};
  const messageCount = Number(metadata.messageCount || 0);
  if (messageCount > SERVER_MESSAGE_CAP) {
    return NextResponse.json({ output: "You have reached the maximum number of messages for this session. Please start a new conversation if you need further assistance." });
  }

  const chatInput = String(body.chatInput || "");
  const landlordId = metadata.landlordId ? String(metadata.landlordId) : undefined;
  const location = metadata.location ? String(metadata.location) : undefined;

  if (!chatInput.trim()) {
    return NextResponse.json({ output: "Please type a message." });
  }

  try {
    const result = await handleChatTurn({ sessionId, chatInput, landlordId, location });
    return NextResponse.json({ output: result.output, booked: result.booked });
  } catch (err) {
    console.error("[chat] turn failed", err);
    return NextResponse.json({ output: "Sorry, I'm having trouble connecting right now. Please try again in a moment." });
  }
}
