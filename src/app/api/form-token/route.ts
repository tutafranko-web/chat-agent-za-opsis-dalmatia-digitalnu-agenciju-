import { NextResponse } from "next/server";
import { newFormToken } from "@/lib/request-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Issued when a form is opened; submissions faster than a human could type are ignored. */
export async function GET() {
  return NextResponse.json({ ft: newFormToken() }, { headers: { "Cache-Control": "no-store" } });
}
