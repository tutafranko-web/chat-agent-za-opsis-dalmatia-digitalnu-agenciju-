import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appendRows } from "@/lib/sheets";
import { sendMail } from "@/lib/mail";

export const runtime = "nodejs";

const ActivitySchema = z.object({
  category: z.string().default(""),
  name: z.string().default(""),
  pricePerPerson: z.union([z.string(), z.number()]).default(""),
  childPrice: z.union([z.string(), z.number()]).default(""),
  commissionPercent: z.union([z.string(), z.number()]).default(""),
});

const Schema = z.object({
  companyName: z.string().min(2),
  contactPerson: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  city: z.string().min(2),
  website: z.string().optional().default(""),
  address: z.string().optional().default(""),
  activities: z.array(ActivitySchema).max(5),
});

const SHEET_ID = process.env.SHEET_OPERATORS_ID || "";
const RANGE = process.env.SHEET_OPERATORS_RANGE || "A:Z";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const d = parsed.data;
  if (!SHEET_ID) return NextResponse.json({ ok: false, error: "Server not configured" }, { status: 500 });

  // Columns: Timestamp | Company Name | Contact Person | Email | Phone | City | Website | Address |
  // Activity 1 Name | Activity 1 Type | Activity 1 Price | Activity 1 Child Price | Activity 1 Commission |
  // ... (repeated for activities 2-5) | Gallery URL
  const row: (string | number)[] = [
    new Date().toISOString(),
    d.companyName,
    d.contactPerson,
    d.email,
    d.phone,
    d.city,
    d.website,
    d.address,
  ];
  for (let i = 0; i < 5; i++) {
    const a = d.activities[i];
    row.push(a?.name || "", a?.category || "", a?.pricePerPerson ?? "", a?.childPrice ?? "", a?.commissionPercent ?? "");
  }
  row.push(""); // Gallery URL placeholder

  try {
    await appendRows(SHEET_ID, RANGE, [row]);
  } catch (e) {
    console.error("[operator/register] sheet append failed", e);
    return NextResponse.json({ ok: false, error: "Could not save registration" }, { status: 500 });
  }

  const html = `<h2>Welcome to Opsis Dalmatia!</h2>
    <p>Hi ${d.contactPerson},</p>
    <p>Your tour operator registration for <strong>${d.companyName}</strong> has been received.</p>
    <p>We will review your details and add you to our booking platform shortly. We'll be in touch on ${d.email}.</p>
    <p>— Opsis Dalmatia</p>`;

  await Promise.allSettled([
    sendMail({ to: d.email, subject: "Opsis Dalmatia — registration received", html }),
    ADMIN_EMAIL
      ? sendMail({
          to: ADMIN_EMAIL,
          subject: `[Opsis] New operator registration: ${d.companyName}`,
          html: `<p>${d.companyName} (${d.city}) — ${d.contactPerson} ${d.email} ${d.phone}<br>Activities: ${d.activities
            .map((a) => a.name)
            .filter(Boolean)
            .join(", ")}</p>`,
        })
      : Promise.resolve(),
  ]);

  return NextResponse.json({ ok: true });
}
