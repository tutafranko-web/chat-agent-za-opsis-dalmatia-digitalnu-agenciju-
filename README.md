# Opsis Dalmatia — Tourist concierge & operator platform

Self-contained Next.js 16 app on Vercel. Replaces a previous n8n-based workflow stack with native API routes, Google Sheets as the storage layer, Groq (Llama 3.3 70B) for the chatbot, and Gmail SMTP for transactional + report mail. No n8n. No database server.

## Routes

| Path | Purpose |
|---|---|
| `/` | Landing + tourist chatbot (WF5) |
| `/operator/register` | Tour operator self-registration (WF2) |
| `/operator/day-off` | Operator blocks unavailable date range (WF8) |
| `/operator/photos` | Operator submits gallery / photo URLs (WF9) |
| `/landlord/register` | Landlord self-registration + QR code (WF4) |
| `/quiz` | Tourist activity recommendation quiz (WF6) |
| `/admin/outreach` | Manual outreach triggers (WF1 + WF3) |

| API | Used by |
|---|---|
| `POST /api/chat` | Chatbot |
| `POST /api/operator/register` | Operator form |
| `POST /api/operator/day-off` | Day-off form |
| `POST /api/operator/photos` | Photos form |
| `POST /api/landlord/register` | Landlord form |
| `POST /api/quiz` | Quiz form |
| `POST /api/outreach/operators` | Admin (Bearer ADMIN_TOKEN) |
| `POST /api/outreach/landlords` | Admin (Bearer ADMIN_TOKEN) |
| `GET  /api/cron/daily-report` | Vercel Cron daily 09:00 (Bearer CRON_SECRET) — WF7 |

## Setup

```bash
npm install
cp .env.example .env.local
# fill values
npm run dev
```

### Google Sheets service account
1. Create a service account in Google Cloud, enable Sheets API, download JSON key.
2. Share each sheet (operators, landlords, bookings, quiz, blackouts) with the service account's `client_email` as Editor.
3. Paste the full JSON into `GOOGLE_SERVICE_ACCOUNT_JSON` (single line, escaped newlines in the private key are auto-restored).

### Expected sheet columns (header row, first sheet)

- **Operators Master**: `Company Name`, `Contact Person`, `Email`, `Phone`, `City`, `Website`, `Address`, then 5 activity blocks (`Activity 1 Name`, `Activity 1 Type`, `Activity 1 Price`, `Activity 1 Child Price`, `Activity 1 Commission`, …), `Gallery URL`.
- **Landlords Master**: `Timestamp`, `Landlord ID`, `Full Name`, `Email`, `Phone`, `Property Name`, `Address`, `City`, `Tracking URL`.
- **Bookings**: `Timestamp`, `Session ID`, `Tourist Name`, `Tourist Email`, `Tourist Phone`, `Activity`, `Operator`, `Operator Email`, `Date`, `Adults`, `Children`, `Price Per Person`, `Total Price`, `Commission Percent`, `Commission EUR`, `Landlord ID`, `Status`.
- **Quiz Results**: `Timestamp`, `Name`, `Email`, `Answers`, `Recommendation`.
- **Blackouts**: `Timestamp`, `Operator Name`, `Operator Email`, `Unavailable Start Date`, `Unavailable End Date`, `Date`, `Reason`, `Notes`.

### Deploy

```bash
vercel link
vercel env add GROQ_API_KEY production
# repeat for every variable in .env.example
vercel --prod
```

Vercel will auto-register the cron in `vercel.json`. Verify under Project → Settings → Cron Jobs.

### Manual cron / outreach triggers

```bash
curl -X GET https://opsisdalmatia.com/api/cron/daily-report \
  -H "Authorization: Bearer $CRON_SECRET"

curl -X POST https://opsisdalmatia.com/api/outreach/operators \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit":5,"dryRun":true}'
```

## Cost (free-tier targets)

- **Vercel Hobby**: serverless + 2 cron jobs (we use 1)
- **Groq free**: Llama 3.3 70B, plenty for chatbot traffic
- **Google Sheets API**: 300 req/min/project — well under
- **Gmail SMTP**: ~500/day per Gmail account — sufficient for transactional
