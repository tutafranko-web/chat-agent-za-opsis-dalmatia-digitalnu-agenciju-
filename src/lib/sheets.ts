import { google, sheets_v4 } from "googleapis";

let cachedClient: sheets_v4.Sheets | null = null;

function getClient(): sheets_v4.Sheets {
  if (cachedClient) return cachedClient;

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON env var is missing");

  let creds: { client_email: string; private_key: string };
  try {
    creds = JSON.parse(raw);
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON");
  }

  // Vercel env strips newlines from private keys; restore them.
  const privateKey = creds.private_key.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  cachedClient = google.sheets({ version: "v4", auth });
  return cachedClient;
}

type Row = Record<string, string>;

const readCache = new Map<string, { rows: Row[]; expiresAt: number }>();
const READ_TTL_MS = 60_000; // 1 minute cache

export interface ReadOptions {
  /** Cache TTL in ms. Default 60s. Set to 0 to skip cache. */
  ttl?: number;
}

/** Read a sheet range as objects keyed by header row. First row must be headers. */
export async function readRows(spreadsheetId: string, range: string, opts: ReadOptions = {}): Promise<Row[]> {
  const ttl = opts.ttl ?? READ_TTL_MS;
  const key = `${spreadsheetId}::${range}`;
  if (ttl > 0) {
    const hit = readCache.get(key);
    if (hit && hit.expiresAt > Date.now()) return hit.rows;
  }

  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const values = res.data.values || [];
  if (values.length === 0) return [];

  const headers = values[0].map((h) => String(h ?? "").trim());
  const rows: Row[] = values.slice(1).map((row) => {
    const obj: Row = {};
    headers.forEach((h, i) => {
      obj[h] = String(row[i] ?? "");
    });
    return obj;
  });

  if (ttl > 0) {
    readCache.set(key, { rows, expiresAt: Date.now() + ttl });
  }
  return rows;
}

/** Append rows to a sheet. Each row is an array of cell values in the column order of the sheet. */
export async function appendRows(spreadsheetId: string, range: string, rows: (string | number)[][]): Promise<void> {
  const sheets = getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: rows },
  });
  // Bust any cached reads for this sheet.
  for (const k of readCache.keys()) {
    if (k.startsWith(`${spreadsheetId}::`)) readCache.delete(k);
  }
}

/** Append a single object as a row, in order of provided header list. */
export async function appendRowByHeaders(
  spreadsheetId: string,
  range: string,
  headers: string[],
  data: Record<string, string | number>
): Promise<void> {
  const row = headers.map((h) => data[h] ?? "");
  await appendRows(spreadsheetId, range, [row]);
}
