import "server-only";
import { JWT } from "google-auth-library";
import { sheets, type sheets_v4 } from "@googleapis/sheets";
import { env } from "./env";
import { sheetSafe } from "./sanitize";
import { TABS, type Row, type TabKey } from "./schema";

/**
 * Google Sheets backend. Reads whole tabs by name (no fixed A:Z range), maps
 * rows by header, caches for 60 s per server instance and writes with
 * valueInputOption RAW so nothing typed by a user is ever evaluated.
 */

let client: sheets_v4.Sheets | null = null;

function api(): sheets_v4.Sheets {
  if (client) return client;
  const raw = env.serviceAccountJson();
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set");
  let creds: { client_email?: string; private_key?: string };
  try {
    creds = JSON.parse(raw);
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON");
  }
  if (!creds.client_email || !creds.private_key) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON must contain client_email and private_key");
  }
  const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  client = sheets({ version: "v4", auth });
  return client;
}

export function serviceAccountEmail(): string | null {
  try {
    return (JSON.parse(env.serviceAccountJson()) as { client_email?: string }).client_email ?? null;
  } catch {
    return null;
  }
}

function sheetId(): string {
  const id = env.sheetId();
  if (!id) throw new Error("SHEET_ID is not set");
  return id;
}

async function withBackoff<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status = (err as { code?: number; status?: number; response?: { status?: number } })?.response?.status
        ?? (err as { code?: number }).code ?? (err as { status?: number }).status;
      const retryable = status === 429 || (typeof status === "number" && status >= 500);
      if (!retryable || attempt === 3) break;
      const delay = 400 * 2 ** attempt + Math.floor(Math.random() * 250);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  console.error(`[sheets] ${label} failed`, (lastErr as Error)?.message ?? lastErr);
  throw lastErr;
}

interface TabCache {
  headers: string[];
  rows: Row[];
  expires: number;
}
const cache = new Map<TabKey, TabCache>();
const TTL_MS = 60_000;

function toRows(values: unknown[][] | null | undefined): { headers: string[]; rows: Row[] } {
  const v = values ?? [];
  if (v.length === 0) return { headers: [], rows: [] };
  const headers = (v[0] as unknown[]).map((h) => String(h ?? "").trim());
  const rows: Row[] = [];
  for (let i = 1; i < v.length; i++) {
    const line = v[i] as unknown[];
    if (!line || line.every((c) => String(c ?? "").trim() === "")) continue;
    const obj: Row = { __row: String(i + 1) };
    headers.forEach((h, j) => {
      if (h) obj[h] = String(line[j] ?? "");
    });
    rows.push(obj);
  }
  return { headers, rows };
}

export async function readTabs(tabs: TabKey[], fresh = false): Promise<Record<string, Row[]>> {
  const now = Date.now();
  const out: Record<string, Row[]> = {};
  const missing: TabKey[] = [];
  for (const t of tabs) {
    const hit = cache.get(t);
    if (!fresh && hit && hit.expires > now) out[t] = hit.rows;
    else missing.push(t);
  }
  if (missing.length) {
    const res = await withBackoff(
      () =>
        api().spreadsheets.values.batchGet({
          spreadsheetId: sheetId(),
          ranges: missing.map((t) => `'${TABS[t].name}'`),
          valueRenderOption: "UNFORMATTED_VALUE",
          dateTimeRenderOption: "FORMATTED_STRING",
        }),
      `batchGet ${missing.join(",")}`,
    );
    const ranges = res.data.valueRanges ?? [];
    missing.forEach((t, i) => {
      const { headers, rows } = toRows(ranges[i]?.values as unknown[][]);
      cache.set(t, { headers, rows, expires: now + TTL_MS });
      out[t] = rows;
    });
  }
  return out;
}

async function headersOf(tab: TabKey): Promise<string[]> {
  const hit = cache.get(tab);
  if (hit && hit.headers.length) return hit.headers;
  await readTabs([tab], true);
  const h = cache.get(tab)?.headers ?? [];
  return h.length ? h : [...TABS[tab].headers];
}

function invalidate(tab: TabKey) {
  cache.delete(tab);
}

export async function appendRecord(tab: TabKey, record: Record<string, unknown>): Promise<void> {
  const headers = await headersOf(tab);
  const row = headers.map((h) => (h in record ? sheetSafe(record[h]) : ""));
  await withBackoff(
    () =>
      api().spreadsheets.values.append({
        spreadsheetId: sheetId(),
        range: `'${TABS[tab].name}'!A1`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [row] },
      }),
    `append ${tab}`,
  );
  invalidate(tab);
}

function colLetter(index: number): string {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/** Update cells of the first row whose `keyField` equals `keyValue`. Returns false if not found. */
export async function updateRecord(
  tab: TabKey,
  keyField: string,
  keyValue: string,
  patch: Record<string, unknown>,
): Promise<boolean> {
  const rows = (await readTabs([tab], true))[tab];
  const headers = await headersOf(tab);
  const row = rows.find((r) => (r[keyField] ?? "").replace(/^'/, "").trim() === keyValue);
  if (!row) return false;
  const rowNumber = Number(row.__row);
  const data = Object.entries(patch)
    .filter(([k]) => headers.includes(k))
    .map(([k, v]) => ({
      range: `'${TABS[tab].name}'!${colLetter(headers.indexOf(k))}${rowNumber}`,
      values: [[sheetSafe(v)]],
    }));
  if (!data.length) return true;
  await withBackoff(
    () =>
      api().spreadsheets.values.batchUpdate({
        spreadsheetId: sheetId(),
        requestBody: { valueInputOption: "RAW", data },
      }),
    `update ${tab}`,
  );
  invalidate(tab);
  return true;
}

/** Health/setup helper: which tabs exist and what their header rows are. */
export async function inspectSpreadsheet(): Promise<{ title: string; tabs: Record<string, string[]> }> {
  const meta = await withBackoff(
    () => api().spreadsheets.get({ spreadsheetId: sheetId(), fields: "properties.title,sheets.properties.title" }),
    "get spreadsheet",
  );
  const names = (meta.data.sheets ?? []).map((s) => s.properties?.title ?? "").filter(Boolean);
  const res = await withBackoff(
    () =>
      api().spreadsheets.values.batchGet({
        spreadsheetId: sheetId(),
        ranges: names.map((n) => `'${n}'!1:1`),
      }),
    "headers",
  );
  const tabs: Record<string, string[]> = {};
  names.forEach((n, i) => {
    tabs[n] = ((res.data.valueRanges?.[i]?.values?.[0] ?? []) as unknown[]).map((h) => String(h));
  });
  return { title: meta.data.properties?.title ?? "", tabs };
}

/** Setup helper: create missing tabs and write header rows (used by scripts/setup-sheet.ts). */
export async function ensureTabs(): Promise<string[]> {
  const { tabs } = await inspectSpreadsheet();
  const created: string[] = [];
  const toCreate = (Object.keys(TABS) as TabKey[]).filter((k) => !(TABS[k].name in tabs));
  if (toCreate.length) {
    await api().spreadsheets.batchUpdate({
      spreadsheetId: sheetId(),
      requestBody: { requests: toCreate.map((k) => ({ addSheet: { properties: { title: TABS[k].name } } })) },
    });
    created.push(...toCreate.map((k) => TABS[k].name));
  }
  const data = (Object.keys(TABS) as TabKey[])
    .filter((k) => !tabs[TABS[k].name] || tabs[TABS[k].name].length === 0)
    .map((k) => ({ range: `'${TABS[k].name}'!A1`, values: [[...TABS[k].headers]] }));
  if (data.length) {
    await api().spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId(),
      requestBody: { valueInputOption: "RAW", data },
    });
  }
  cache.clear();
  return created;
}

/** Bulk write rows (setup/import only). */
export async function appendMany(tab: TabKey, records: Record<string, unknown>[]): Promise<void> {
  if (!records.length) return;
  const headers = await headersOf(tab);
  const values = records.map((rec) => headers.map((h) => (h in rec ? sheetSafe(rec[h]) : "")));
  for (let i = 0; i < values.length; i += 500) {
    await withBackoff(
      () =>
        api().spreadsheets.values.append({
          spreadsheetId: sheetId(),
          range: `'${TABS[tab].name}'!A1`,
          valueInputOption: "RAW",
          insertDataOption: "INSERT_ROWS",
          requestBody: { values: values.slice(i, i + 500) },
        }),
      `appendMany ${tab}`,
    );
  }
  invalidate(tab);
}
