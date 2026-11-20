import { NextResponse } from "next/server";
import type { Lang } from "./types";

export function parseLang(v: unknown): Lang {
  return v === "hr" ? "hr" : "en";
}

export function ok(data: Record<string, unknown> = {}, init: ResponseInit = {}) {
  return NextResponse.json({ ok: true, ...data }, { ...init, headers: { "Cache-Control": "no-store", ...(init.headers ?? {}) } });
}

export function fail(status: number, code: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, code, ...extra }, { status, headers: { "Cache-Control": "no-store" } });
}

export function int(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export function str(v: unknown, max = 200): string {
  return typeof v === "string" ? v.slice(0, max) : "";
}
