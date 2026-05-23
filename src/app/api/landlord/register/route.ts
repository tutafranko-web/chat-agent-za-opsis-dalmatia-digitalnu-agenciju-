import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { appendRows } from "@/lib/sheets";
import { sendMail } from "@/lib/mail";
import { qrPngBuffer, qrDataUrl } from "@/lib/qr";

export const runtime = "nodejs";

const Schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  propertyName: z.string().min(2),
  address: z.string().min(2),
  city: z.string().min(2),
});

const SHEET_ID = process.env.SHEET_LANDLORDS_ID || "";
const RANGE = process.env.SHEET_LANDLORDS_RANGE || "A:Z";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const BASE_URL = process.env.PUBLIC_BASE_URL || "https://opsisdalmatia.com";

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const d = parsed.data;
  if (!SHEET_ID) return NextResponse.json({ ok: false, error: "Server not configured" }, { status: 500 });

  const landlordId = `L-${randomUUID().slice(0, 8).toUpperCase()}`;
  const trackingUrl = `${BASE_URL}/?landlord=${landlordId}`;

  // Columns: Timestamp | Landlord ID | Full Name | Email | Phone | Property Name | Address | City | Tracking URL
  const row = [new Date().toISOString(), landlordId, d.fullName, d.email, d.phone, d.propertyName, d.address, d.city, trackingUrl];

  try {
    await appendRows(SHEET_ID, RANGE, [row]);
  } catch (e) {
    console.error("[landlord/register] sheet append failed", e);
    return NextResponse.json({ ok: false, error: "Could not save registration" }, { status: 500 });
  }

  let qrPng: Buffer | null = null;
  let qrData = "";
  try {
    qrPng = await qrPngBuffer(trackingUrl);
    qrData = await qrDataUrl(trackingUrl);
  } catch (e) {
    console.error("[landlord/register] QR generation failed", e);
  }

  const html = `<h2>Welcome to Opsis Dalmatia, ${d.fullName}!</h2>
    <p>Your landlord ID is <strong>${landlordId}</strong>.</p>
    <p>Print and display the attached QR code in your property. When guests scan it, they reach our concierge and any booking they make earns you a commission.</p>
    <p>Direct link: <a href="${trackingUrl}">${trackingUrl}</a></p>
    <p>— Opsis Dalmatia</p>`;

  await Promise.allSettled([
    sendMail({
      to: d.email,
      subject: `Opsis Dalmatia — your landlord QR code`,
      html,
      attachments: qrPng ? [{ filename: `opsis-${landlordId}.png`, content: qrPng, contentType: "image/png" }] : undefined,
    }),
    ADMIN_EMAIL
      ? sendMail({
          to: ADMIN_EMAIL,
          subject: `[Opsis] New landlord: ${d.propertyName} (${landlordId})`,
          html: `<p>${d.fullName} — ${d.email} — ${d.phone}<br>${d.propertyName}, ${d.address}, ${d.city}<br>Tracking: ${trackingUrl}</p>`,
        })
      : Promise.resolve(),
  ]);

  return NextResponse.json({ ok: true, landlordId, trackingUrl, qrDataUrl: qrData });
}
