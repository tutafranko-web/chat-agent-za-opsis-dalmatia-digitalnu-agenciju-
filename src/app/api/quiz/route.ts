import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appendRows, readRows } from "@/lib/sheets";
import { sendMail } from "@/lib/mail";
import { chatCompletion } from "@/lib/groq";
import { QUIZ_SYSTEM_PROMPT } from "@/lib/prompts";

export const runtime = "nodejs";

const Schema = z.object({
  email: z.string().email(),
  name: z.string().optional().default(""),
  answers: z.record(z.string(), z.union([z.string(), z.number(), z.array(z.string())])),
});

const SHEET_OPERATORS_ID = process.env.SHEET_OPERATORS_ID || "";
const SHEET_QUIZ_ID = process.env.SHEET_QUIZ_ID || "";
const QUIZ_RANGE = process.env.SHEET_QUIZ_RANGE || "A:Z";
const OPERATORS_RANGE = process.env.SHEET_OPERATORS_RANGE || "A:Z";

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const { email, name, answers } = parsed.data;

  // Build operator summary for the LLM
  let operatorData = "";
  if (SHEET_OPERATORS_ID) {
    try {
      const rows = await readRows(SHEET_OPERATORS_ID, OPERATORS_RANGE);
      const top = rows.slice(0, 30); // cap to keep prompt small
      operatorData = "=== [OPERATOR DATA] ===\n" + top
        .map((r) => {
          const activities = [1, 2, 3, 4, 5]
            .map((i) => r[`Activity ${i} Name`])
            .filter(Boolean)
            .join(", ");
          return `- ${r["Company Name"]} | ${r["City"]} | ${activities}`;
        })
        .join("\n") + "\n=== [END OPERATOR DATA] ===";
    } catch (e) {
      console.error("[quiz] operators read failed", e);
    }
  }

  const userMsg = `Tourist quiz responses (JSON):\n${JSON.stringify(answers)}\n\n${operatorData}`;

  let recommendation = "";
  try {
    recommendation = await chatCompletion(
      [
        { role: "system", content: QUIZ_SYSTEM_PROMPT },
        { role: "user", content: userMsg },
      ],
      { temperature: 0.7, maxTokens: 1000 }
    );
  } catch (e) {
    console.error("[quiz] llm failed", e);
    recommendation = "Thanks for taking the quiz! Visit https://opsisdalmatia.com to explore activities.";
  }

  if (SHEET_QUIZ_ID) {
    try {
      await appendRows(SHEET_QUIZ_ID, QUIZ_RANGE, [[new Date().toISOString(), name, email, JSON.stringify(answers), recommendation]]);
    } catch (e) {
      console.error("[quiz] sheet append failed", e);
    }
  }

  await sendMail({
    to: email,
    subject: "Your Opsis Dalmatia activity recommendations",
    html: `<p>Hi ${name || "there"},</p><p>Based on your quiz, here are your top activity recommendations:</p><pre style="white-space:pre-wrap;font-family:Arial,sans-serif;">${recommendation}</pre><p><a href="https://opsisdalmatia.com">Browse and book on opsisdalmatia.com</a></p>`,
  }).catch((e) => console.error("[quiz] email failed", e));

  return NextResponse.json({ ok: true, recommendation });
}
