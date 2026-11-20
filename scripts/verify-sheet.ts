/**
 * Check the spreadsheet: tabs, headers and row counts.
 *   npx tsx --conditions=react-server --env-file=.env.vercel scripts/verify-sheet.ts
 */
import { googleIdentity, inspectSpreadsheet, readTabs } from "@/lib/sheets";
import { TABS, type TabKey } from "@/lib/schema";

async function main() {
  console.log(`Google: ${googleIdentity()}`);
  const info = await inspectSpreadsheet();
  console.log(`Spreadsheet: ${info.title}`);
  let ok = true;
  const keys = Object.keys(TABS) as TabKey[];
  const data = await readTabs(keys, true);
  for (const k of keys) {
    const t = TABS[k];
    const headers = info.tabs[t.name];
    if (!headers) {
      ok = false;
      console.log(`✗ ${t.name}: missing tab`);
      continue;
    }
    const missing = t.headers.filter((h) => !headers.includes(h));
    if (missing.length) ok = false;
    console.log(`${missing.length ? "✗" : "✓"} ${t.name}: ${data[k]?.length ?? 0} rows${missing.length ? ` · missing headers: ${missing.join(", ")}` : ""}`);
  }
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
