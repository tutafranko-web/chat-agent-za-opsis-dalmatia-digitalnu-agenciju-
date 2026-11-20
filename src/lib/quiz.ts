import "server-only";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { readAttribution } from "./attribution";
import { getOffers, rankOffers, toPublic, type OfferInternal } from "./catalog";
import { anthropic, model } from "./claude";
import { env } from "./env";
import { newQuizId } from "./ids";
import { sendMail } from "./mail";
import { quizResults } from "./mail-templates";
import { QUIZ, type QuizAnswers } from "./quiz-data";
import { normalizeAnswers, rankTypes } from "./quiz-scoring";
import { appendQuiz, logEvent } from "./repo";
import { isEmail, normalizeEmail } from "./sanitize";
import { getType } from "./taxonomy";
import type { Lang, PublicOffer } from "./types";

export interface QuizResult {
  quiz_id: string;
  intro: string;
  tip: string;
  items: { offer: PublicOffer; reason: string }[];
}

const Explanation = z.object({
  intro: z.string(),
  items: z.array(z.object({ activity_id: z.string(), reason: z.string() })),
  tip: z.string(),
});

function answerSummary(a: QuizAnswers): string {
  return QUIZ.filter((q) => a[q.id] !== undefined)
    .map((q) => {
      const keys = Array.isArray(a[q.id]) ? (a[q.id] as string[]) : [a[q.id] as string];
      const labels = keys.map((k) => q.options.find((o) => o.key === k)?.label.en ?? k);
      return `${q.label.en} ${labels.join(", ")}`;
    })
    .join("\n");
}

const FALLBACK = {
  en: {
    intro: "Here are five experiences that match what you told us.",
    tip: "Book a day or two ahead in summer — the best boat tours fill up early.",
  },
  hr: {
    intro: "Evo pet doživljaja koji odgovaraju vašim odgovorima.",
    tip: "Ljeti rezervirajte dan-dva unaprijed jer se najbolji izleti brzo popune.",
  },
};

async function explain(lang: Lang, a: QuizAnswers, picks: OfferInternal[]): Promise<{ intro: string; tip: string; reasons: Record<string, string> } | null> {
  if (!env.hasAnthropicKey()) return null;
  try {
    const res = await anthropic().messages.parse(
      {
        model: model(),
        max_tokens: 1500,
        output_config: { effort: "low", format: zodOutputFormat(Explanation) },
        messages: [
          {
            role: "user",
            content: `Write in ${lang === "hr" ? "Croatian" : "English"} for a visitor in Split, Croatia who took our activity quiz.

Their answers:
${answerSummary(a)}

We recommend exactly these offers (do not add others, do not change prices):
${picks.map((o) => `- ${o.id}: ${o.title} (${o.city}, ${o.duration}, from ${o.price_adult} EUR)`).join("\n")}

Return: intro (max 30 words, warm, no greeting), one reason per offer (max 25 words: why it fits their answers, concrete), and one practical tip (max 25 words). Don't invent facts beyond the titles above.`,
          },
        ],
      },
      { timeout: 8000, maxRetries: 0 },
    );
    const parsed = res.parsed_output;
    if (!parsed) return null;
    const reasons = Object.fromEntries(parsed.items.map((i) => [i.activity_id, i.reason.slice(0, 300)]));
    return { intro: parsed.intro.slice(0, 300), tip: parsed.tip.slice(0, 300), reasons };
  } catch (err) {
    console.error("[quiz] explanation failed", (err as Error).message);
    return null;
  }
}

export async function runQuiz(input: {
  answers: unknown;
  lang: Lang;
  attr: unknown;
  email: unknown;
  emailConsent: unknown;
}): Promise<QuizResult> {
  const answers = normalizeAnswers(input.answers);
  const offers = await getOffers();
  const minPrice: Record<string, number> = {};
  for (const o of offers) minPrice[o.type_key] = Math.min(minPrice[o.type_key] ?? Infinity, o.price_adult);
  const area = (typeof answers.base === "string" && answers.base !== "other" ? answers.base : null) ?? readAttribution(input.attr)?.area ?? null;

  const ranked = rankTypes(answers, minPrice, 5);
  const picks: OfferInternal[] = [];
  for (const t of ranked) {
    const best = rankOffers(offers, { typeKey: t.key, area, limit: 1 })[0];
    if (best) picks.push(best);
  }
  // Fill up with featured offers if the filters were very strict.
  if (picks.length < 3) {
    for (const o of rankOffers(offers, { area, limit: 10 })) {
      if (picks.length >= 3) break;
      if (!picks.some((p) => p.type_key === o.type_key) && getType(o.type_key)?.utility !== true) picks.push(o);
    }
  }

  const ai = await explain(input.lang, answers, picks);
  const fb = FALLBACK[input.lang];
  const items = picks.map((o) => ({
    offer: toPublic(o),
    reason: ai?.reasons[o.id] || getType(o.type_key)?.blurb[input.lang] || o.description,
  }));
  const result: QuizResult = { quiz_id: newQuizId(), intro: ai?.intro || fb.intro, tip: ai?.tip || fb.tip, items };

  const attr = readAttribution(input.attr);
  const email = normalizeEmail(input.email);
  const wantsEmail = isEmail(email) && input.emailConsent === true;
  try {
    await appendQuiz({
      quiz_id: result.quiz_id,
      created_at: new Date().toISOString(),
      language: input.lang,
      landlord_id: attr?.lid ?? "",
      answers_json: JSON.stringify(answers),
      top_types: ranked.map((r) => r.key).join(","),
      recommended_ids: picks.map((p) => p.id).join(","),
      email: wantsEmail ? email : "",
      consent_marketing: "",
    });
  } catch (err) {
    await logEvent("warn", "quiz_store_failed", result.quiz_id, (err as Error).message);
  }

  if (wantsEmail) {
    const base = env.baseUrl();
    const mail = quizResults(
      input.lang,
      result.intro,
      items.map((it) => ({
        title: it.offer.title,
        reason: it.reason,
        price: `${input.lang === "hr" ? "od" : "from"} ${it.offer.price_adult} €`,
        url: `${base}/?offer=${encodeURIComponent(it.offer.id)}&lang=${input.lang}`,
      })),
      result.tip,
    );
    await sendMail({ to: email, audience: "requester", tag: "quiz_results", idempotencyKey: `quiz-${result.quiz_id}`, ...mail });
  }
  return result;
}
