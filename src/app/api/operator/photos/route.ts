import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appendRows } from "@/lib/sheets";
import { sendMail } from "@/lib/mail";

export const runtime = "nodejs";

const Schema = z.object({
  companyName: z.string().min(2),
  email: z.string().email(),
  galleryUrl: z.string().url().optional().default(""),
  photoUrls: z.array(z.string().url()).max(20).default([]),
});

const SHEET_ID = process.env.SHEET_OPERATOR_PHOTOS_ID || process.env.SHEET_OPERATORS_ID || "";
const RANGE = process.env.SHEET_OPERATOR_PHOTOS_RANGE || "Photos!A:Z";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const d = parsed.data;
  if (!d.galleryUrl && d.photoUrls.length === 0) {
    return NextResponse.json({ ok: false, error: "Provide a gallery URL or at least one photo URL" }, { status: 400 });
  }
  if (!SHEET_ID) return NextResponse.json({ ok: false, error: "Server not configured" }, { status: 500 });

  // Columns: Timestamp | Company Name | Email | Gallery URL | Photo URLs
  const row = [new Date().toISOString(), d.companyName, d.email, d.galleryUrl, d.photoUrls.join("\n")];

  try {
    await appendRows(SHEET_ID, RANGE, [row]);
  } catch (e) {
    console.error("[photos] sheet append failed", e);
    return NextResponse.json({ ok: false, error: "Could not save photos" }, { status: 500 });
  }

  if (ADMIN_EMAIL) {
    await sendMail({
      to: ADMIN_EMAIL,
      subject: `[Opsis] New photos: ${d.companyName}`,
      html: `<p>${d.companyName} (${d.email})<br>Gallery: ${d.galleryUrl || "—"}<br>Photos: ${d.photoUrls.length}</p><pre>${d.photoUrls.join("\n")}</pre>`,
    }).catch((e) => console.error("[photos] admin email failed", e));
  }

  return NextResponse.json({ ok: true });
}
