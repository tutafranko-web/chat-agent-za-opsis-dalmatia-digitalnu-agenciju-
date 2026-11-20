"use client";

import { useState, useSyncExternalStore } from "react";
import type { Lang } from "./types";

function subscribeStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

/** Interface language: server renders "en", the browser switches after hydration. */
export function useLang(): [Lang, (l: Lang) => void] {
  const detected = useSyncExternalStore(subscribeStorage, () => detectLang(), () => "en" as Lang);
  const [override, setOverride] = useState<Lang | null>(null);
  const lang = override ?? detected;
  return [
    lang,
    (l: Lang) => {
      setOverride(l);
      saveLang(l);
    },
  ];
}

/** Browser helpers: storage that never throws, language detection, JSON fetch. */

export function getLocal<T>(key: string): T | null {
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}

export function setLocal(key: string, value: unknown) {
  try {
    if (value === null || value === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / quota — ignore */
  }
}

export function getSession<T>(key: string): T | null {
  try {
    const v = window.sessionStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}

export function setSession(key: string, value: unknown) {
  try {
    if (value === null || value === undefined) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function detectLang(): Lang {
  try {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "hr" || q === "en") return q;
    const saved = window.localStorage.getItem("opsis-lang");
    if (saved === "hr" || saved === "en") return saved;
    const nav = (navigator.languages?.[0] || navigator.language || "en").toLowerCase();
    return nav.startsWith("hr") || nav.startsWith("bs") || nav.startsWith("sr") ? "hr" : "en";
  } catch {
    return "en";
  }
}

export function saveLang(l: Lang) {
  try {
    window.localStorage.setItem("opsis-lang", l);
    document.documentElement.lang = l;
  } catch {
    /* ignore */
  }
}

export interface ApiResult<T> {
  status: number;
  data: (T & { ok: boolean; code?: string }) | null;
  networkError?: boolean;
}

export async function postJson<T>(url: string, body: unknown, signal?: AbortSignal): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { status: res.status, data };
  } catch {
    return { status: 0, data: null, networkError: true };
  }
}

export async function getJson<T>(url: string): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { status: res.status, data };
  } catch {
    return { status: 0, data: null, networkError: true };
  }
}

/** Attribution token from a landlord QR link, kept for 30 days. */
export interface StoredAttr {
  token: string;
  pn: string | null;
  area: string | null;
  exp: number;
}

export function readStoredAttr(): StoredAttr | null {
  const a = getLocal<StoredAttr>("opsis-attr");
  if (!a || !a.token || a.exp < Date.now()) return null;
  return a;
}

/** Validate ?landlord=/&location= (or refresh a stored token) with the server. */
export async function syncAttribution(): Promise<StoredAttr | null> {
  let landlord: string | null = null;
  let location: string | null = null;
  try {
    const sp = new URLSearchParams(window.location.search);
    landlord = sp.get("landlord");
    location = sp.get("location");
    if (landlord || location) {
      sp.delete("landlord");
      sp.delete("location");
      const qs = sp.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    }
  } catch {
    /* ignore */
  }
  if (!landlord && !location) return readStoredAttr();
  const res = await postJson<{ attr: string | null; property_name: string | null; area: string | null }>("/api/session", { landlord, location });
  if (res.data?.ok && res.data.attr) {
    const stored: StoredAttr = { token: res.data.attr, pn: res.data.property_name, area: res.data.area, exp: Date.now() + 29 * 86400_000 };
    setLocal("opsis-attr", stored);
    return stored;
  }
  return readStoredAttr();
}

/** Zagreb calendar date (YYYY-MM-DD) for min-date hints in the date picker. */
export function zagrebToday(): { date: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Zagreb",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")) };
}

export function addDaysIso(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function earliestBookable(): string {
  const z = zagrebToday();
  return addDaysIso(z.date, z.hour < 15 ? 1 : 2);
}

export function fmtDate(iso: string, lang: Lang): string {
  try {
    return new Intl.DateTimeFormat(lang === "hr" ? "hr-HR" : "en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
  } catch {
    return iso;
  }
}

export function eur(n: number): string {
  return `${Number.isInteger(n) ? n : n.toFixed(2)} €`;
}
