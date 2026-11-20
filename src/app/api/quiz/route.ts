import type { NextRequest } from "next/server";
import { fail, ok, parseLang } from "@/lib/http";
import { runQuiz } from "@/lib/quiz";
import { LIMITS } from "@/lib/rate-limit";
import { guardPost, looksHuman } from "@/lib/request-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const g = await guardPost(req, { limit: LIMITS.quiz, maxBytes: 6000 });
  if (!g.ok) return g.response;
  const b = g.body;
  const human = looksHuman(b);
  try {
    const result = await runQuiz({
      answers: b.answers,
      lang: parseLang(b.lang),
      attr: b.attr,
      // Bots get recommendations but never an e-mail.
      email: human ? b.email : "",
      emailConsent: human ? b.email_consent : false,
    });
    return ok({ result });
  } catch (err) {
    console.error("[quiz]", (err as Error).message);
    return fail(503, "unavailable");
  }
}
