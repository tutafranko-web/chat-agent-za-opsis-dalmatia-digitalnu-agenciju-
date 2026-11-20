"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ListChecks, Loader2, MessageCircle, RotateCcw, Send } from "lucide-react";
import { TOURIST } from "@/i18n/tourist";
import { getJson, getSession, postJson, setSession, syncAttribution, useLang, type StoredAttr } from "@/lib/client";
import { CATEGORIES, GROUPS, menuFor, typeLabel, type CategoryKey } from "@/lib/taxonomy";
import type { ChatResponse, DraftView, PublicOffer, UIBlock } from "@/lib/types";
import { BookingCard } from "./booking-card";
import { OfferStrip } from "./offer-card";
import { SafeMarkdown } from "./safe-markdown";
import { Icon, OfferVisual } from "./type-visual";
import { SiteFooter } from "./site-footer";

type OfferLite = Parameters<typeof BookingCard>[0]["offer"];

type Item =
  | { id: string; kind: "welcome" }
  | { id: string; kind: "user"; text: string }
  | { id: string; kind: "bot"; blocks: UIBlock[] }
  | { id: string; kind: "menu"; category: CategoryKey }
  | { id: string; kind: "group"; group: string; types: string[] }
  | { id: string; kind: "offers"; title: string; offers: PublicOffer[] }
  | { id: string; kind: "booking"; offer: OfferLite; draft?: DraftView | null; source: "card" | "chat" | "quiz"; done?: string };

const UI_KEY = "opsis-chat-ui-v2";
const STATE_KEY = "opsis-chat-state-v2";
const rid = () => Math.random().toString(36).slice(2, 10);

function Bubble({ children, from = "bot" }: { children: React.ReactNode; from?: "bot" | "user" }) {
  return from === "user" ? (
    <div className="flex justify-end animate-rise">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-sea px-4 py-2.5 text-[15px] leading-relaxed text-ink whitespace-pre-wrap">{children}</div>
    </div>
  ) : (
    <div className="flex animate-rise">
      <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-line bg-ink-2 px-4 py-3 text-[15px] leading-relaxed text-stone">{children}</div>
    </div>
  );
}

export function Concierge() {
  const [lang, setLang] = useLang();
  const t = TOURIST[lang];
  const [attr, setAttr] = useState<StoredAttr | null>(null);
  const [items, setItems] = useState<Item[]>([{ id: "w", kind: "welcome" }]);
  const [chatState, setChatState] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [featured, setFeatured] = useState<PublicOffer[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [ready, setReady] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Boot: language, attribution, saved conversation, deep links ──────────
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    (async () => {
      const a = await syncAttribution();
      // Restore the conversation (sessionStorage is only available after hydration).
      const saved = getSession<Item[]>(UI_KEY);
      if (saved?.length) setItems(saved);
      setChatState(getSession<string>(STATE_KEY));
      setAttr(a);
      const [summary, feat] = await Promise.all([
        getJson<{ types: Record<string, number> }>("/api/catalog?view=summary"),
        getJson<{ offers: PublicOffer[] }>(`/api/catalog?featured=1${a?.area ? `&area=${a.area}` : ""}`),
      ]);
      if (summary.data?.ok) setCounts(summary.data.types);
      if (feat.data?.ok) setFeatured(feat.data.offers);
      const offerId = new URLSearchParams(window.location.search).get("offer");
      if (offerId) {
        const r = await getJson<{ offers: PublicOffer[] }>(`/api/catalog?id=${encodeURIComponent(offerId)}`);
        const o = r.data?.offers?.[0];
        if (o) setItems((prev) => [...prev, { id: rid(), kind: "booking", offer: o, source: "quiz" }]);
        window.history.replaceState(null, "", window.location.pathname);
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    setSession(UI_KEY, items.slice(-60));
  }, [items, ready]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [items, sending]);

  const switchLang = () => setLang(lang === "en" ? "hr" : "en");

  const push = useCallback((it: Item | Item[]) => setItems((prev) => [...prev, ...(Array.isArray(it) ? it : [it])]), []);

  // ── Menu actions (no AI, no message quota) ───────────────────────────────
  const openCategory = (c: CategoryKey) => {
    const cat = CATEGORIES.find((x) => x.key === c)!;
    push([{ id: rid(), kind: "user", text: cat.label[lang] }, { id: rid(), kind: "menu", category: c }]);
  };

  const showOffers = async (title: string, query: string) => {
    setLoadingMenu(true);
    const res = await getJson<{ offers: PublicOffer[] }>(`/api/catalog?${query}${attr?.area ? `&area=${attr.area}` : ""}`);
    setLoadingMenu(false);
    const offers = res.data?.offers ?? [];
    push([{ id: rid(), kind: "user", text: title }, offers.length ? { id: rid(), kind: "offers", title, offers } : { id: rid(), kind: "bot", blocks: [{ type: "text", text: t.noOffers }] }]);
  };

  const openType = (key: string) => showOffers(typeLabel(key, lang), `type=${encodeURIComponent(key)}`);
  const openGroup = (group: string, types: string[]) => push([{ id: rid(), kind: "user", text: GROUPS[group]?.label[lang] ?? group }, { id: rid(), kind: "group", group, types }]);
  const book = (o: PublicOffer | OfferLite, draft?: DraftView | null, source: "card" | "chat" | "quiz" = "card") =>
    push({ id: rid(), kind: "booking", offer: o, draft: draft ?? null, source });

  // ── AI chat ──────────────────────────────────────────────────────────────
  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || sending) return;
    setInput("");
    push({ id: rid(), kind: "user", text: msg });
    setSending(true);
    const res = await postJson<ChatResponse>("/api/chat", { message: msg, state: chatState, lang, attr: attr?.token ?? null });
    setSending(false);
    if (res.networkError || !res.data) {
      push({ id: rid(), kind: "bot", blocks: [{ type: "notice", text: res.status === 429 ? t.rateLimited : t.networkError, tone: "warn" }] });
      return;
    }
    if (res.status === 429) {
      push({ id: rid(), kind: "bot", blocks: [{ type: "notice", text: t.rateLimited, tone: "warn" }] });
      return;
    }
    const d = res.data;
    if (d.state !== undefined) {
      setChatState(d.state);
      setSession(STATE_KEY, d.state);
    }
    if (typeof d.remaining === "number") setRemaining(d.remaining);
    const blocks = (d.blocks ?? []).filter((b) => b.type !== "booking");
    const bookings = (d.blocks ?? []).filter((b): b is Extract<UIBlock, { type: "booking" }> => b.type === "booking");
    if (blocks.length) push({ id: rid(), kind: "bot", blocks });
    for (const b of bookings) book(b.draft.offer, b.draft, "chat");
  };

  const newChat = () => {
    setItems([{ id: "w", kind: "welcome" }]);
    setChatState(null);
    setRemaining(null);
    setSession(STATE_KEY, null);
    setSession(UI_KEY, null);
  };

  const onAsk = (o: PublicOffer) => {
    send(t.askAboutMsg(o.title, o.id));
  };

  const visibleCategories = useMemo(() => CATEGORIES, []);

  // ── Render ───────────────────────────────────────────────────────────────
  const renderItem = (it: Item) => {
    switch (it.kind) {
      case "welcome":
        return (
          <div key={it.id} className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl border border-line lg:hidden">
              <OfferVisual typeKey="speedboat_tours" image="/activities/island-aerial.jpg" className="h-36 w-full" priority sizes="100vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              <p className="absolute bottom-3 left-4 right-4 font-display text-[24px] font-semibold leading-tight">{attr?.pn ? t.welcomeGuestOf(attr.pn) : t.welcomeTitle}</p>
            </div>
            {attr?.pn && <p className="hidden font-display text-[20px] font-semibold text-sea lg:block">{t.welcomeGuestOf(attr.pn)}</p>}
            <Bubble>{t.greeting}</Bubble>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t.chooseType}>
              {visibleCategories.map((c) => (
                <button key={c.key} type="button" className="chip" onClick={() => openCategory(c.key)}>
                  <Icon name={c.icon} className="size-4 text-sea" />
                  {c.label[lang]}
                </button>
              ))}
              <Link href={`/quiz?lang=${lang}`} className="chip border-sun/60">
                <ListChecks className="size-4 text-sun" aria-hidden />
                {t.quizChip}
              </Link>
              <button type="button" className="chip" onClick={() => inputRef.current?.focus()}>
                <MessageCircle className="size-4 text-sea" aria-hidden />
                {t.askChip}
              </button>
            </div>
            {featured.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-[13px] font-semibold uppercase tracking-wider text-mist">{t.featured}</p>
                <OfferStrip offers={featured} t={t} onBook={(o) => book(o)} onAsk={onAsk} />
              </div>
            )}
          </div>
        );
      case "user":
        return <Bubble key={it.id} from="user">{it.text}</Bubble>;
      case "menu": {
        const entries = menuFor(it.category).filter((e) =>
          !counts ? true : e.kind === "type" ? (counts[e.key] ?? 0) > 0 : e.types.some((k) => (counts[k] ?? 0) > 0),
        );
        return (
          <div key={it.id} className="space-y-2 animate-rise">
            <div className="flex flex-wrap gap-2">
              {entries.map((e) =>
                e.kind === "group" ? (
                  <button key={e.key} type="button" className="chip" onClick={() => openGroup(e.key, e.types)} disabled={loadingMenu}>
                    <Icon name={GROUPS[e.key]?.icon ?? "ship"} className="size-4 text-sea" />
                    {GROUPS[e.key]?.label[lang] ?? e.key}
                  </button>
                ) : (
                  <button key={e.key} type="button" className="chip" onClick={() => openType(e.key)} disabled={loadingMenu}>
                    {typeLabel(e.key, lang)}
                  </button>
                ),
              )}
            </div>
          </div>
        );
      }
      case "group":
        return (
          <div key={it.id} className="flex flex-wrap gap-2 animate-rise">
            {it.types
              .filter((k) => !counts || (counts[k] ?? 0) > 0)
              .map((k) => (
                <button key={k} type="button" className="chip" onClick={() => openType(k)} disabled={loadingMenu}>
                  {typeLabel(k, lang)}
                </button>
              ))}
            <button type="button" className="chip" onClick={() => showOffers(GROUPS[it.group]?.label[lang] ?? it.group, `types=${it.types.join(",")}`)} disabled={loadingMenu}>
              {lang === "hr" ? "Prikaži sve" : "Show all"}
            </button>
          </div>
        );
      case "offers":
        return (
          <div key={it.id} className="space-y-2 animate-rise">
            <p className="text-[14px] text-mist">{t.offersFor(it.title)}</p>
            <OfferStrip offers={it.offers} t={t} onBook={(o) => book(o)} onAsk={onAsk} />
          </div>
        );
      case "booking":
        return (
          <BookingCard
            key={it.id}
            offer={it.offer}
            initialDraft={it.draft}
            lang={lang}
            t={t}
            attr={attr?.token ?? null}
            source={it.source}
            onDone={(d) => setItems((prev) => prev.map((x) => (x.id === it.id && x.kind === "booking" ? { ...x, done: d.ref } : x)))}
          />
        );
      case "bot":
        return (
          <div key={it.id} className="space-y-3">
            {it.blocks.map((b, i) => {
              if (b.type === "text") return <Bubble key={i}><SafeMarkdown text={b.text} /></Bubble>;
              if (b.type === "notice")
                return (
                  <p key={i} className={`rounded-xl border px-4 py-3 text-[14px] ${b.tone === "warn" ? "border-sun/40 bg-sun/10" : "border-line bg-ink-2"}`} role="status">
                    {b.text}
                  </p>
                );
              if (b.type === "cards") return <OfferStrip key={i} offers={b.offers} t={t} onBook={(o) => book(o)} onAsk={onAsk} />;
              return null;
            })}
          </div>
        );
    }
  };

  return (
    <div className="flex h-dvh flex-col lg:flex-row">
      {/* Desktop hero */}
      <aside className="relative hidden lg:flex lg:w-[42%] xl:w-[46%]">
        <OfferVisual typeKey="speedboat_tours" image="/activities/blue-cave.jpg" className="absolute inset-0" priority sizes="46vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
        <div className="relative mt-auto space-y-4 p-10 xl:p-14">
          <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-sea">Opsis Dalmatia · {t.brandTag}</p>
          <h1 className="font-display text-[44px] font-semibold leading-[1.05] xl:text-[54px]">{t.welcomeTitle}</h1>
          <p className="max-w-md text-[17px] leading-relaxed text-mist">{t.greeting}</p>
          <div className="flex flex-wrap gap-3 pt-2 text-[14px]">
            <Link className="underline underline-offset-4 hover:text-sea" href="/partneri/iznajmljivaci">{t.forHosts}</Link>
            <Link className="underline underline-offset-4 hover:text-sea" href="/partneri/organizatori">{t.forOperators}</Link>
          </div>
        </div>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-display text-[19px] font-semibold">Opsis</span>
            <span className="truncate text-[11px] font-bold uppercase tracking-[0.2em] text-sea">{t.brandTag}</span>
            <span className="rounded-full border border-sun/50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-sun" title={t.pilotNote}>
              {t.pilot}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {items.length > 1 && (
              <button type="button" onClick={newChat} className="btn-ghost min-h-10 px-3 text-[13px]" title={t.newChat}>
                <RotateCcw className="size-4" aria-hidden />
                <span className="hidden sm:inline">{t.newChat}</span>
              </button>
            )}
            <button type="button" onClick={switchLang} className="btn-ghost min-h-10 px-3 text-[13px] font-bold" aria-label={t.langName}>
              {t.switchTo}
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto" role="log" aria-live="polite" aria-relevant="additions">
          <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-5">
            {items.map(renderItem)}
            {(sending || loadingMenu) && (
              <div className="flex items-center gap-2 text-[14px] text-mist" role="status">
                {sending ? (
                  <>
                    <span className="flex gap-1" aria-hidden>
                      <span className="size-2 rounded-full bg-sea animate-pulse-dot" />
                      <span className="size-2 rounded-full bg-sea animate-pulse-dot [animation-delay:150ms]" />
                      <span className="size-2 rounded-full bg-sea animate-pulse-dot [animation-delay:300ms]" />
                    </span>
                    {t.thinking}
                  </>
                ) : (
                  <Loader2 className="size-4 animate-spin" aria-label={t.thinking} />
                )}
              </div>
            )}
            {items.length > 2 && (
              <button type="button" className="chip text-[14px]" onClick={() => push({ id: rid(), kind: "welcome" })}>
                <ArrowLeft className="size-4" aria-hidden /> {lang === "hr" ? "Kategorije" : "Categories"}
              </button>
            )}
            <div ref={endRef} />
          </div>
        </div>

        <div className="border-t border-line bg-ink/95 px-4 pt-3" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
          <form
            className="mx-auto flex w-full max-w-2xl items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <label htmlFor="composer" className="sr-only">{t.composerPlaceholder}</label>
            <textarea
              id="composer"
              ref={inputRef}
              rows={1}
              maxLength={1500}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={t.composerPlaceholder}
              className="field max-h-36 min-h-12 flex-1 resize-none py-3 leading-snug [field-sizing:content]"
            />
            <button type="submit" className="btn-primary size-12 shrink-0 p-0" disabled={sending || !input.trim()} aria-label={t.send}>
              {sending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Send className="size-5" aria-hidden />}
            </button>
          </form>
          <div className="mx-auto mt-2 flex w-full max-w-2xl flex-wrap items-center justify-between gap-x-3 gap-y-1 pb-1 text-[12px] text-mist">
            <span>{t.aiDisclosure}</span>
            {remaining !== null && remaining <= 5 && <span className="text-sun">{t.remaining(remaining)}</span>}
          </div>
          <SiteFooter lang={lang} compact />
        </div>
      </main>
    </div>
  );
}
