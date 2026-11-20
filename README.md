# Opsis Dalmatia · AI Concierge (v2)

Chatbot i mala platforma za izlete u Splitu i Dalmaciji. Gosti pregledavaju ponudu gumbima, pitaju AI concierge (Claude Sonnet 5.5) i šalju **zahtjeve za rezervaciju**. Organizator potvrđuje ili odbija mailom. Iznajmljivači dobivaju besplatne QR kodove, a svaki zahtjev njihovih gostiju vezan je uz njihov objekt.

Verzija 2 zamjenjuje stari n8n sustav. n8n poslužitelj više ne postoji, a svi tokovi su ovdje.

## Što radi

| Stranica | Namjena |
|---|---|
| `/` | Concierge: izbornik (kategorija → vrsta → kartice), rezervacija na kartici, AI chat |
| `/quiz` | Kviz od 9 pitanja → 5 preporuka s gumbom „Rezerviraj” |
| `/partneri/iznajmljivaci` | Registracija iznajmljivača → ID, dva QR koda (chat + kviz), mail, plakat |
| `/partneri/organizatori` | Prijava organizatora (čeka odobrenje) |
| `/partneri/upravljanje/[token]` | Osobna stranica organizatora: neradni dani, fotografije |
| `/partneri/plakat/[id]` | Plakat A4 za ispis (EN/DE/IT/HR) |
| `/r/[token]` | Organizator potvrđuje / odbija zahtjev (link iz maila) |
| `/admin` | Ispravnost sustava, odobrenja, zadnji zahtjevi, outreach (Basic auth) |
| `/privacy`, `/uvjeti`, `/odjava` | Privatnost, uvjeti, odjava od outreach mailova |

Stare adrese (`/landlord/register`, `/operator/*`, `/hr/*`, `/en/*`) preusmjeravaju se na nove.

## Kako je složeno

- **Next.js 16** (App Router) na Vercelu, sve na jednom projektu.
- **Podaci:** jedna Google tablica s karticama (`Operateri`, `Aktivnosti`, `Iznajmljivaci`, `Rezervacije`, `Kviz`, `Neradni_dani`, `Leadovi`, `Suppression`, `Outreach_Sent`, `Izvjestaji`, `Dnevnik`). Upis je uvijek `RAW` uz zaštitu od formula. Lokalno se bez Googlea koristi memorija s demo podacima (`STORE=memory`).
- **AI:** Claude Sonnet 5.5 s četiri alata (`search_activities`, `get_activity`, `check_availability`, `prepare_booking`). Alati nikad ne vraćaju e-mail, telefon ni proviziju, a AI nikad ne dobiva kontakt podatke gosta. Razgovor drži preglednik kao potpisan zapis (HMAC) koji se samo nadopunjuje.
- **Rezervacija bez AI-ja:** cijena i provjere idu kroz `/api/booking/quote`, a slanje kroz `/api/booking/confirm`. Cijenu, rok, kapacitet i neradne dane provjerava poslužitelj. Ista kartica poslana dvaput daje istu oznaku.
- **Pravila:** zahtjevi za sutra do 15:00 (Europe/Zagreb), najviše 180 dana unaprijed, kapacitet `max_per_day`, djeca 50 % ako cijena nije upisana, aktivnosti „samo za odrasle”.
- **Mail:** Resend, s načinima `MAIL_MODE`:
  - `log` — ništa se ne šalje;
  - `sandbox` — sve ide na `SANDBOX_TO`;
  - `trial` — gosti i podnositelji primaju mail, a partnerski mailovi idu adminu;
  - `live` — normalno slanje.
  - Demo adrese (`+demo-`) uvijek idu adminu.
- **Zaštita:** zod s ograničenjima duljine, provjera porijekla, samo JSON, ograničenje po IP-u, honeypot i minimalno vrijeme ispunjavanja obrasca, potpisani linkovi, admin iza Basic autha, cron samo s `CRON_SECRET`, CSP.

## Pokretanje lokalno

```bash
npm install
cp .env.example .env.local   # STORE=memory, MAIL_MODE=log za početak
npm run dev
npm test                     # 43 testa (pravila, tokovi, Claude petlja s lažnim klijentom)
```

## Google tablica

1. Servisni račun s uključenim Sheets API-jem. Tablicu podijeli s njegovim `client_email` kao Editor.
2. `vercel env pull .env.vercel --environment=production` (datoteka je u `.gitignore`).
3. `npm run sheet:setup` stvara kartice i zaglavlja, uvozi demo ponudu i, ako je postavljen `OLD_LEADS_SHEET_ID`, uvozi leadove.
4. `npm run sheet:verify` provjerava kartice i zaglavlja.

Ručno uređivanje tablice je u redu (npr. status operatera `active`/`paused`). Zaglavlja se ne smiju preimenovati.

## Pilot

- `PILOT_MODE=true` prikazuje oznaku „Pilot”, a `SHOW_DEMO_OFFERS=true` prikazuje 56 demo ponuda izmišljenih tvrtki (oznaka „Demo”).
- Podaci tvrtke u `src/config/company.ts` su izmišljeni. Prije pravog rada ih zamijeni.
- `LANDLORD_SHARE_PCT` je prazan, pa iznajmljivači ne vide iznose.
- Outreach je isključen (`OUTREACH_ENABLED=false`).

## Objava

```bash
vercel deploy --prod
npm run smoke:chat -- https://chat-agent-za-opsis-dalmatia-digita.vercel.app
```

Cron (`vercel.json`) šalje dnevni izvještaj u 05:00 UTC za prethodni dan. Drugi poziv istog dana se preskače.
