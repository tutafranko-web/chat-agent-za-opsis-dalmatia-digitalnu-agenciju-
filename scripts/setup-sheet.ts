/**
 * One-off setup of the Google Spreadsheet:
 *   1. creates any missing tabs and writes their header rows,
 *   2. imports the PILOT demo catalogue (operators, activities, demo landlord)
 *      if the Operateri tab is still empty,
 *   3. optionally imports outreach leads from the old n8n lead sheet
 *      (OLD_LEADS_SHEET_ID, shared with the service account as Viewer).
 *
 * Run (env from Vercel or a local file):
 *   npx tsx --conditions=react-server --env-file=.env.vercel scripts/setup-sheet.ts
 */
import { JWT } from "google-auth-library";
import { sheets } from "@googleapis/sheets";
import { appendMany, ensureTabs, readTabs } from "@/lib/sheets";
import { buildDemoData } from "@/data/demo-catalog";
import { isEmail, normalizeEmail } from "@/lib/sanitize";

async function importLeads() {
  const oldId = process.env.OLD_LEADS_SHEET_ID;
  if (!oldId) return console.log("• OLD_LEADS_SHEET_ID not set — skipping lead import");
  const existing = (await readTabs(["leads"], true)).leads ?? [];
  if (existing.length) return console.log(`• Leadovi already has ${existing.length} rows — skipping lead import`);
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}");
  const auth = new JWT({ email: creds.client_email, key: String(creds.private_key).replace(/\\n/g, "\n"), scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"] });
  const api = sheets({ version: "v4", auth });
  const res = await api.spreadsheets.values.get({ spreadsheetId: oldId, range: "A1:N2000" });
  const rows = res.data.values ?? [];
  const header = (rows[0] ?? []).map((h) => String(h).trim());
  const col = (name: string) => header.indexOf(name);
  const seen = new Set<string>();
  const leads: Record<string, unknown>[] = [];
  for (const r of rows.slice(1)) {
    const emails = String(r[col("Emails Found")] ?? "").split(/[,\s]+/).map(normalizeEmail).filter(isEmail);
    const email = emails[0];
    if (!email || seen.has(email)) continue;
    seen.add(email);
    const contacted = String(r[12] ?? "").toLowerCase() === "sent";
    leads.push({
      email,
      name: "",
      company: String(r[col("Business Name")] ?? "").slice(0, 120),
      type: "operator",
      city: String(r[col("Address")] ?? "").split(",").slice(-2, -1)[0]?.trim() ?? "",
      source: `maps:${String(r[col("Search Keyword")] ?? "")}`,
      status: contacted ? "contacted_2026_03" : "",
      notes: String(r[col("Website")] ?? "").slice(0, 200),
    });
  }
  await appendMany("leads", leads);
  console.log(`• Imported ${leads.length} operator leads (${leads.filter((l) => l.status).length} marked as already contacted in March 2026)`);
}

async function main() {
  const created = await ensureTabs();
  console.log(created.length ? `• Created tabs: ${created.join(", ")}` : "• All tabs exist");
  const current = await readTabs(["operators", "activities", "landlords"], true);
  if ((current.operators ?? []).length === 0) {
    const demo = buildDemoData();
    await appendMany("operators", demo.operators as unknown as Record<string, unknown>[]);
    await appendMany("activities", demo.activities as unknown as Record<string, unknown>[]);
    await appendMany("landlords", demo.landlords as unknown as Record<string, unknown>[]);
    console.log(`• Imported demo data: ${demo.operators.length} operators, ${demo.activities.length} activities, ${demo.landlords.length} landlord`);
  } else {
    console.log(`• Operateri already has ${current.operators.length} rows — demo import skipped`);
  }
  await importLeads();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
