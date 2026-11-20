import "server-only";
import { env } from "./env";
import { sheetSafe } from "./sanitize";
import { TABS, type Row, type TabKey } from "./schema";
import * as gs from "./sheets";
import { buildDemoData } from "@/data/demo-catalog";

/**
 * Storage abstraction. Production uses Google Sheets; local development and
 * tests use an in-memory store seeded with the demo catalogue (nothing is
 * persisted). Both speak the same row format (strings keyed by header).
 */
export interface DataStore {
  kind: "sheets" | "memory";
  read(tabs: TabKey[], fresh?: boolean): Promise<Record<string, Row[]>>;
  append(tab: TabKey, record: Record<string, unknown>): Promise<void>;
  update(tab: TabKey, keyField: string, keyValue: string, patch: Record<string, unknown>): Promise<boolean>;
  /** Overwrite rows whose `keyField` matches, append the rest. */
  upsertMany(tab: TabKey, keyField: string, records: Record<string, unknown>[]): Promise<void>;
}

function toRow(tab: TabKey, record: Record<string, unknown>): Row {
  const row: Row = {};
  for (const h of TABS[tab].headers) {
    const v = record[h];
    row[h] = v === undefined || v === null ? "" : String(sheetSafe(v));
  }
  return row;
}

class MemoryStore implements DataStore {
  kind = "memory" as const;
  private data: Record<string, Row[]>;

  constructor() {
    const seed = buildDemoData();
    this.data = Object.fromEntries((Object.keys(TABS) as TabKey[]).map((k) => [k, [] as Row[]]));
    this.data.operators = seed.operators.map((o) => toRow("operators", o as unknown as Record<string, unknown>));
    this.data.activities = seed.activities.map((a) => toRow("activities", a as unknown as Record<string, unknown>));
    this.data.landlords = seed.landlords.map((l) => toRow("landlords", l as unknown as Record<string, unknown>));
  }

  async read(tabs: TabKey[]): Promise<Record<string, Row[]>> {
    return Object.fromEntries(tabs.map((t) => [t, (this.data[t] ?? []).map((r) => ({ ...r }))]));
  }

  async append(tab: TabKey, record: Record<string, unknown>): Promise<void> {
    (this.data[tab] ??= []).push(toRow(tab, record));
  }

  async update(tab: TabKey, keyField: string, keyValue: string, patch: Record<string, unknown>): Promise<boolean> {
    const row = (this.data[tab] ??= []).find((r) => (r[keyField] ?? "").replace(/^'/, "") === keyValue);
    if (!row) return false;
    for (const [k, v] of Object.entries(patch)) row[k] = v === undefined || v === null ? "" : String(sheetSafe(v));
    return true;
  }

  async upsertMany(tab: TabKey, keyField: string, records: Record<string, unknown>[]): Promise<void> {
    for (const rec of records) {
      const key = String(rec[keyField] ?? "");
      const idx = (this.data[tab] ??= []).findIndex((r) => (r[keyField] ?? "").replace(/^'/, "") === key);
      if (idx >= 0) this.data[tab][idx] = toRow(tab, rec);
      else this.data[tab].push(toRow(tab, rec));
    }
  }

  /** Test helper. */
  reset() {
    const fresh = new MemoryStore();
    this.data = fresh.data;
  }
}

class SheetsStore implements DataStore {
  kind = "sheets" as const;
  read(tabs: TabKey[], fresh = false) {
    return gs.readTabs(tabs, fresh);
  }
  append(tab: TabKey, record: Record<string, unknown>) {
    return gs.appendRecord(tab, record);
  }
  update(tab: TabKey, keyField: string, keyValue: string, patch: Record<string, unknown>) {
    return gs.updateRecord(tab, keyField, keyValue, patch);
  }
  upsertMany(tab: TabKey, keyField: string, records: Record<string, unknown>[]) {
    return gs.upsertMany(tab, keyField, records);
  }
}

const g = globalThis as unknown as { __opsisStore?: DataStore };

export function store(): DataStore {
  if (g.__opsisStore) return g.__opsisStore;
  g.__opsisStore = env.store() === "sheets" ? new SheetsStore() : new MemoryStore();
  return g.__opsisStore;
}

/** Tests only: swap or reset the store. */
export function __setStoreForTests(s: DataStore | null) {
  g.__opsisStore = s ?? undefined;
}
export function __resetMemoryStore() {
  const s = g.__opsisStore;
  if (s && s.kind === "memory") (s as MemoryStore).reset();
}
