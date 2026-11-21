import { COMPANY } from "@/config/company";
import { escapeHtml as e } from "./sanitize";
import type { Booking, Landlord, Operator } from "./schema";
import { typeLabel } from "./taxonomy";
import { formatDate } from "./zagreb-time";

type L = "en" | "hr";
export interface Mail {
  subject: string;
  html: string;
  text: string;
}

const C = { ink: "#0E1A22", ink2: "#16262F", stone: "#F3EFE7", sea: "#0B6E6D", seaLight: "#3CC2BE", sun: "#F2994A", body: "#44535B" };

function eur(n: number): string {
  return `${(Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, "")} €`;
}

function layout(lang: L, title: string, inner: string, preheader = ""): string {
  const footer =
    lang === "hr"
      ? `${e(COMPANY.legalName)} · OIB ${e(COMPANY.oib)} · ${e(COMPANY.address)}`
      : `${e(COMPANY.legalName)} · VAT/OIB ${e(COMPANY.oib)} · ${e(COMPANY.address)}`;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(title)}</title></head>
<body style="margin:0;background:${C.stone};">
<span style="display:none;max-height:0;overflow:hidden">${e(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.stone};padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FBF9F4;border-radius:16px;overflow:hidden;border:1px solid #E2DBCD">
<tr><td style="background:${C.ink};padding:20px 24px;font:600 18px/1.2 Georgia,serif;color:${C.stone}">Opsis Dalmatia <span style="color:${C.seaLight};font:700 11px/1 Arial,sans-serif;letter-spacing:2px;vertical-align:middle">&nbsp;AI CONCIERGE</span></td></tr>
<tr><td style="padding:24px;font:15px/1.6 Arial,Helvetica,sans-serif;color:${C.body}">
<!--BANNER-->
<h1 style="margin:0 0 12px;font:600 22px/1.25 Georgia,serif;color:${C.ink}">${e(title)}</h1>
${inner}
</td></tr>
<tr><td style="padding:16px 24px;background:#EFEAE0;font:12px/1.5 Arial,sans-serif;color:#6B7378">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

function p(html: string): string {
  return `<p style="margin:0 0 12px">${html}</p>`;
}

function button(href: string, label: string, color = C.sea): string {
  return `<p style="margin:18px 0"><a href="${e(href)}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;font:700 15px/1 Arial,sans-serif;padding:14px 22px;border-radius:10px">${e(label)}</a></p>`;
}

function table(rows: [string, string][]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:8px 0 16px;font:14px/1.5 Arial,sans-serif">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:7px 10px 7px 0;color:#6B7378;vertical-align:top;white-space:nowrap">${e(k)}</td><td style="padding:7px 0;color:${C.ink};font-weight:600">${v}</td></tr>`,
    )
    .join("")}</table>`;
}

/** Escaped HTML fragment → plain text for the text/plain part (tags out, entities back). */
function plain(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function textTable(rows: [string, string][]): string {
  return rows.map(([k, v]) => `${k}: ${plain(v)}`).join("\n");
}

function party(b: Booking, lang: L): string {
  const a = lang === "hr" ? `${b.adults} odr.` : `${b.adults} adult${b.adults === 1 ? "" : "s"}`;
  if (!b.children) return a;
  return lang === "hr" ? `${a} + ${b.children} djece` : `${a} + ${b.children} child${b.children === 1 ? "" : "ren"}`;
}

function bookingRows(b: Booking, lang: L, opts: { operator?: boolean; contact?: boolean; money?: boolean } = {}): [string, string][] {
  const T = lang === "hr"
    ? { ref: "Oznaka", act: "Aktivnost", op: "Organizator", date: "Datum", ppl: "Osobe", total: "Ukupno", name: "Gost", email: "E-mail", phone: "Telefon", notes: "Napomena", comm: "Provizija" }
    : { ref: "Reference", act: "Activity", op: "Organised by", date: "Date", ppl: "Guests", total: "Total", name: "Guest", email: "E-mail", phone: "Phone", notes: "Notes", comm: "Commission" };
  const rows: [string, string][] = [
    [T.ref, e(b.ref)],
    [T.act, e(b.activity_title)],
  ];
  if (opts.operator !== false) rows.push([T.op, e(b.operator_name)]);
  rows.push([T.date, e(formatDate(b.date, lang))], [T.ppl, e(party(b, lang))], [T.total, e(eur(b.total_eur))]);
  if (opts.contact) {
    rows.push([T.name, e(b.tourist_name)], [T.email, e(b.tourist_email)], [T.phone, e(b.tourist_phone)]);
    if (b.notes) rows.push([T.notes, e(b.notes)]);
  }
  if (opts.money) rows.push([T.comm, e(`${b.commission_pct}% = ${eur(b.commission_eur)}`)]);
  return rows;
}

// ── Tourist ────────────────────────────────────────────────────────────────

export function touristRequestReceived(b: Booking, lang: L): Mail {
  const title = lang === "hr" ? "Zahtjev za rezervaciju je primljen" : "We've received your booking request";
  const intro =
    lang === "hr"
      ? `Hvala, ${e(b.tourist_name)}! Organizator sada provjerava termin i javit ćemo vam se mailom s potvrdom, obično unutar 24 sata. Plaćanje se dogovara izravno s organizatorom.`
      : `Thank you, ${e(b.tourist_name)}! The organiser is now checking availability. You'll get a confirmation e-mail, usually within 24 hours. Payment is arranged directly with the organiser.`;
  const rows = bookingRows(b, lang);
  const html = layout(lang, title, p(intro) + table(rows) + p(lang === "hr" ? "Ako ne vidite odgovor, provjerite i mapu neželjene pošte." : "If you don't see our reply, please check your spam folder."), b.ref);
  return { subject: `${title} · ${b.ref}`, html, text: `${title}\n\n${plain(intro)}\n\n${textTable(rows)}` };
}

export function touristConfirmed(b: Booking, lang: L, meetingPoint: string, note: string): Mail {
  const title = lang === "hr" ? "Vaša rezervacija je potvrđena" : "Your booking is confirmed";
  const rows = bookingRows(b, lang);
  if (meetingPoint) rows.push([lang === "hr" ? "Mjesto okupljanja" : "Meeting point", e(meetingPoint)]);
  const noteHtml = note ? p(`<em>${lang === "hr" ? "Poruka organizatora" : "Message from the organiser"}:</em> ${e(note)}`) : "";
  const intro = lang === "hr" ? "Organizator je potvrdio vaš termin. Uživajte!" : "The organiser has confirmed your booking. Enjoy your day!";
  const html = layout(lang, title, p(intro) + table(rows) + noteHtml, b.ref);
  return { subject: `${title} · ${b.ref}`, html, text: `${title}\n\n${intro}\n\n${textTable(rows)}${note ? `\n\n${note}` : ""}` };
}

export function touristDeclined(b: Booking, lang: L, note: string, chatUrl: string): Mail {
  const title = lang === "hr" ? "Termin nažalost nije dostupan" : "Sorry, that date isn't available";
  const intro =
    lang === "hr"
      ? "Organizator nažalost ne može potvrditi ovaj termin. Nije vam ništa naplaćeno. Concierge vam rado nađe drugi termin ili sličnu aktivnost."
      : "Unfortunately the organiser can't confirm this request. You have not been charged. Our concierge will gladly find another date or a similar activity.";
  const noteHtml = note ? p(`<em>${lang === "hr" ? "Poruka organizatora" : "Message from the organiser"}:</em> ${e(note)}`) : "";
  const html = layout(lang, title, p(intro) + table(bookingRows(b, lang)) + noteHtml + button(chatUrl, lang === "hr" ? "Nađi drugi termin" : "Find another option"), b.ref);
  return { subject: `${title} · ${b.ref}`, html, text: `${title}\n\n${intro}\n\n${chatUrl}` };
}

// ── Operator & admin: booking requests ─────────────────────────────────────

function calendarHint(calendarUrl: string): string {
  return p(`<span style="font-size:14px">Pun si ili ne radiš neke dane? <a href="${e(calendarUrl)}" style="color:#0B6E6D;font-weight:700">Otvori svoj kalendar</a> i dodirni dan. Gosti tada te dane ne traže.</span>`);
}

export function operatorNewRequest(b: Booking, respondUrl: string, calendarUrl: string): Mail {
  const title = "Novi zahtjev za rezervaciju";
  const rows = bookingRows(b, "hr", { operator: false, contact: true });
  const inner =
    p(`Gost je preko Opsis Concierge poslao zahtjev za <strong>${e(b.activity_title)}</strong>. Molimo potvrdite ili odbijte, idealno unutar 24 sata. Gost tek tada dobiva potvrdu.`) +
    table(rows) +
    button(respondUrl, "Potvrdi ili odbij") +
    calendarHint(calendarUrl) +
    p(`<span style="font-size:13px;color:#6B7378">New booking request via Opsis Concierge. Please confirm or decline using the button above. Fully booked or closed on some days? Open your calendar link and tap the day.</span>`);
  return {
    subject: `Novi zahtjev ${b.ref}: ${b.activity_title}, ${formatDate(b.date, "hr")}`,
    html: layout("hr", title, inner, b.ref),
    text: `${title}\n\n${textTable(rows)}\n\nPotvrdi ili odbij: ${respondUrl}\n\nTvoj kalendar (pun / ne radim): ${calendarUrl}`,
  };
}

export function adminNewRequest(b: Booking, respondUrl: string, partnerRouting: string, calendarUrl?: string): Mail {
  const title = `Novi zahtjev ${b.ref}`;
  const rows = bookingRows(b, "hr", { contact: true, money: true });
  if (b.landlord_id) rows.push(["Iznajmljivač", e(b.landlord_id)]);
  if (b.area) rows.push(["Područje", e(b.area)]);
  rows.push(["Izvor", e(b.source)]);
  const inner =
    p(e(partnerRouting)) + table(rows) + button(respondUrl, "Otvori potvrdu / odbijanje") +
    (calendarUrl ? p(`<span style="font-size:14px">Kalendar operatera (upiši za njega ako ti javi telefonom): <a href="${e(calendarUrl)}" style="color:#0B6E6D;font-weight:700">otvori</a></span>`) : "");
  return { subject: `[Opsis] ${title}: ${b.activity_title}`, html: layout("hr", title, inner, b.ref), text: `${title}\n\n${textTable(rows)}\n\n${respondUrl}${calendarUrl ? `\n\nKalendar operatera: ${calendarUrl}` : ""}` };
}

export function adminBookingResponded(b: Booking): Mail {
  const title = `${b.ref}: ${b.status === "confirmed" ? "potvrđeno" : "odbijeno"}`;
  const rows = bookingRows(b, "hr", { contact: false, money: true });
  if (b.response_note) rows.push(["Poruka", e(b.response_note)]);
  return { subject: `[Opsis] ${title}`, html: layout("hr", title, table(rows)), text: `${title}\n\n${textTable(rows)}` };
}

// ── Operators: registration & approval ─────────────────────────────────────

export function operatorRegistrationReceived(o: Operator, lang: L): Mail {
  const title = lang === "hr" ? "Prijava je zaprimljena" : "Registration received";
  const inner =
    lang === "hr"
      ? p(`Poštovani ${e(o.contact_person)}, hvala na prijavi tvrtke <strong>${e(o.company)}</strong> u Opsis Concierge.`) +
        p("Pregledat ćemo ponudu i javiti vam se kad bude objavljena. Tada dobivate i osobnu poveznicu za neradne dane i fotografije.")
      : p(`Dear ${e(o.contact_person)}, thank you for registering <strong>${e(o.company)}</strong> with Opsis Concierge.`) +
        p("We'll review your listing and let you know when it goes live. You'll then also get a personal link to manage days off and photos.");
  return { subject: `${title} · Opsis Concierge`, html: layout(lang, title, inner), text: `${title}\n\n${o.company}` };
}

export function adminOperatorRegistration(o: Operator, activities: { title: string; type_key: string; price_adult: number | null; commission_pct: number | null }[], approveUrl: string): Mail {
  const title = `Nova prijava operatera: ${o.company}`;
  const rows: [string, string][] = [
    ["ID", e(o.operator_id)], ["Tvrtka", e(o.company)], ["Kontakt", e(o.contact_person)], ["E-mail", e(o.email)],
    ["Telefon", e(o.phone)], ["Grad", e(o.city)], ["Web", e(o.website)], ["Max gostiju/dan", e(o.max_per_day ?? "")],
  ];
  const list = activities
    .map((a) => `<li>${e(a.title)} (${e(typeLabel(a.type_key, "hr"))}) · ${e(a.price_adult ?? "?")} € · provizija ${e(a.commission_pct ?? "?")}%</li>`)
    .join("");
  const inner = table(rows) + `<ul style="margin:0 0 12px;padding-left:18px">${list}</ul>` + button(approveUrl, "Pregledaj i odobri");
  return { subject: `[Opsis] ${title}`, html: layout("hr", title, inner), text: `${title}\n\n${textTable(rows)}\n\n${approveUrl}` };
}

export function operatorApproved(o: Operator, manageUrl: string): Mail {
  const title = "Vaša ponuda je objavljena";
  const inner =
    p(`Poštovani ${e(o.contact_person)}, ponuda tvrtke <strong>${e(o.company)}</strong> sada je vidljiva gostima u Opsis Concierge.`) +
    p("Zahtjeve za rezervaciju dobivat ćete mailom s gumbima Potvrdi / Odbij. Sve dane smatramo slobodnima dok ne kažete drugačije. Kad ste puni ili ne radite, otvorite svoj kalendar i dodirnite dan, ili napišite rečenicu, npr. „sutra pun, subota još 4 mjesta”. Ako imate Google kalendar ili sustav za rezervacije, možete ga i povezati. Poveznicu nemojte prosljeđivati.") +
    button(manageUrl, "Otvori moj kalendar") +
    p(`<span style="font-size:13px;color:#6B7378">Your listing is live. Every day counts as available until you say otherwise: open your calendar to mark full or closed days, link your existing calendar, or add photos.</span>`);
  return { subject: "Ponuda je objavljena · Opsis Concierge", html: layout("hr", title, inner), text: `${title}\n\n${manageUrl}` };
}

// ── Landlords ──────────────────────────────────────────────────────────────

export function landlordWelcome(l: Landlord, chatUrl: string, quizUrl: string, posterUrl: string, lang: L): Mail {
  const title = lang === "hr" ? "Dobrodošli u Opsis Concierge" : "Welcome to Opsis Concierge";
  const rows: [string, string][] = [
    [lang === "hr" ? "Vaš ID" : "Your ID", `<code>${e(l.landlord_id)}</code>`],
    [lang === "hr" ? "Objekt" : "Property", e(l.property_name)],
    ["Chat", `<a href="${e(chatUrl)}">${e(chatUrl)}</a>`],
    [lang === "hr" ? "Kviz" : "Quiz", `<a href="${e(quizUrl)}">${e(quizUrl)}</a>`],
  ];
  const inner =
    (lang === "hr"
      ? p(`Poštovani ${e(l.full_name)}, u privitku su dva QR koda: jedan otvara concierge chat, a drugi kviz preporuka za vaše goste. Svaki upit koji dođe preko njih vezan je uz vaš objekt.`)
      : p(`Dear ${e(l.full_name)}, attached are two QR codes: one opens the concierge chat, the other the recommendation quiz for your guests. Every request made through them is linked to your property.`)) +
    table(rows) +
    button(posterUrl, lang === "hr" ? "Otvori plakat za ispis" : "Open printable poster") +
    p(lang === "hr" ? "Savjet: plakat stavite uz Wi-Fi lozinku, a poveznicu u poruku dobrodošlice." : "Tip: put the poster next to the Wi-Fi password and the link in your welcome message.");
  return { subject: `${title} · ${l.property_name}`, html: layout(lang, title, inner), text: `${title}\n\n${textTable(rows)}\n\n${posterUrl}` };
}

export function adminLandlordRegistered(l: Landlord): Mail {
  const title = `Novi iznajmljivač: ${l.property_name}`;
  const rows: [string, string][] = [
    ["ID", e(l.landlord_id)], ["Ime", e(l.full_name)], ["E-mail", e(l.email)], ["Telefon", e(l.phone)],
    ["Adresa", e(`${l.address}, ${l.city}`)], ["Jedinica", e(l.units ?? "")], ["Gostiju/mj (ljeto)", e(l.avg_guests_summer ?? "")], ["Platforma", e(l.booking_platform)],
  ];
  return { subject: `[Opsis] ${title}`, html: layout("hr", title, table(rows)), text: `${title}\n\n${textTable(rows)}` };
}

// ── Quiz ───────────────────────────────────────────────────────────────────

export function quizResults(lang: L, intro: string, items: { title: string; reason: string; price: string; url: string }[], tip: string): Mail {
  const title = lang === "hr" ? "Vaše preporuke za Dalmaciju" : "Your Dalmatia recommendations";
  const list = items
    .map(
      (it, i) =>
        `<tr><td style="padding:10px 0;border-top:1px solid #E2DBCD"><strong style="color:${C.ink}">${i + 1}. ${e(it.title)}</strong> <span style="color:#6B7378">· ${e(it.price)}</span><br>${e(it.reason)}<br><a href="${e(it.url)}" style="color:${C.sea};font-weight:700">${lang === "hr" ? "Rezerviraj" : "Book this"} →</a></td></tr>`,
    )
    .join("");
  const inner = p(e(intro)) + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${list}</table>` + (tip ? p(`<em>${e(tip)}</em>`) : "");
  return {
    subject: title,
    html: layout(lang, title, inner),
    text: `${title}\n\n${intro}\n\n${items.map((it, i) => `${i + 1}. ${it.title} (${it.price})\n${it.reason}\n${it.url}`).join("\n\n")}\n\n${tip}`,
  };
}

// ── Reports ────────────────────────────────────────────────────────────────

export function adminDailyReport(date: string, bookings: Booking[], stalePending: Booking[]): Mail {
  const title = `Dnevni izvještaj · ${formatDate(date, "hr")}`;
  const total = bookings.reduce((s, b) => s + b.total_eur, 0);
  const comm = bookings.reduce((s, b) => s + b.commission_eur, 0);
  const rows = bookings
    .map((b) => `<tr><td style="padding:6px 8px 6px 0">${e(b.ref)}</td><td style="padding:6px 8px 6px 0">${e(b.activity_title)}</td><td style="padding:6px 8px 6px 0">${e(formatDate(b.date, "hr"))}</td><td style="padding:6px 8px 6px 0">${e(b.status)}</td><td style="padding:6px 0;text-align:right">${e(eur(b.total_eur))}</td></tr>`)
    .join("");
  const stale = stalePending.length
    ? p(`<strong>Čekaju odgovor operatera dulje od 12 h:</strong> ${stalePending.map((b) => e(b.ref)).join(", ")}`)
    : "";
  const inner =
    p(`Novih zahtjeva: <strong>${bookings.length}</strong> · vrijednost ${e(eur(total))} · provizija ${e(eur(comm))}`) +
    (bookings.length ? `<table role="presentation" style="width:100%;font:13px/1.4 Arial,sans-serif;border-collapse:collapse">${rows}</table>` : p("Nema novih zahtjeva.")) +
    stale;
  return { subject: `[Opsis] ${title}`, html: layout("hr", title, inner), text: `${title}\n${bookings.length} zahtjeva, ${eur(total)}` };
}

export function partnerDailyReport(kind: "operator" | "landlord", name: string, date: string, bookings: Booking[], landlordShare: number | null): Mail {
  const title = `Pregled za ${formatDate(date, "hr")}`;
  const list = bookings
    .map((b) =>
      kind === "operator"
        ? `<li>${e(b.ref)} · ${e(b.activity_title)} · ${e(formatDate(b.date, "hr"))} · ${e(party(b, "hr"))} · ${e(b.status)}</li>`
        : `<li>${e(b.ref)} · ${e(typeLabel(b.type_key, "hr"))} · ${e(formatDate(b.date, "hr"))} · ${e(b.status)}</li>`,
    )
    .join("");
  const share = kind === "landlord"
    ? landlordShare === null
      ? p("Provizija: prema dogovoru (iznosi se prikazuju nakon pilot faze).")
      : p(`Vaš udio provizije: <strong>${e(eur(landlordShare))}</strong>`)
    : "";
  const inner = p(`Poštovani, ${e(name)}: jučer je preko Opsis Concierge stiglo <strong>${bookings.length}</strong> zahtjeva.`) + `<ul style="padding-left:18px">${list}</ul>` + share;
  return { subject: `Opsis Concierge · ${title}`, html: layout("hr", title, inner), text: `${title}\n${bookings.length}` };
}

// ── Outreach (B2B, admin-triggered) ────────────────────────────────────────

export function outreachOperator(name: string, company: string, registerUrl: string, unsubscribeUrl: string): Mail {
  const title = `${company || "Pozdrav"}: više gostiju bez fiksnih troškova`;
  const inner =
    p(`Poštovani ${e(name || "kolega")},`) +
    p("Opsis Dalmatia pokreće AI concierge: gosti u apartmanima skeniraju QR kod, biraju izlet u chatu i šalju zahtjev za rezervaciju izravno organizatoru. Nema fiksnih troškova, plaća se samo provizija na potvrđene rezervacije.") +
    p("Registracija traje oko 3 minute, a ponudu objavljujemo nakon kratke provjere.") +
    button(registerUrl, "Registriraj ponudu") +
    p(`<span style="font-size:12px;color:#6B7378">Ovaj mail šaljemo poslovnim adresama turističkih organizatora u Splitsko-dalmatinskoj županiji. Adresu smo pronašli na vašoj javnoj stranici ili Google profilu. <a href="${e(unsubscribeUrl)}">Ne želim više primati poruke</a>.</span>`);
  return { subject: title, html: layout("hr", title, inner), text: `${title}\n\n${registerUrl}\n\nOdjava: ${unsubscribeUrl}` };
}

export function outreachLandlord(name: string, property: string, registerUrl: string, unsubscribeUrl: string): Mail {
  const title = `${property || "Vaš objekt"}: QR concierge za vaše goste`;
  const inner =
    p(`Poštovani ${e(name || "")},`) +
    p("Vaši gosti stalno pitaju što raditi. Opsis Concierge im to odgovara umjesto vas: besplatni QR kod u apartmanu otvara chat s izletima, a svaki zahtjev vezan je uz vaš objekt.") +
    button(registerUrl, "Besplatno preuzmi QR kod") +
    p(`<span style="font-size:12px;color:#6B7378"><a href="${e(unsubscribeUrl)}">Ne želim više primati poruke</a>.</span>`);
  return { subject: title, html: layout("hr", title, inner), text: `${title}\n\n${registerUrl}\n\nOdjava: ${unsubscribeUrl}` };
}
