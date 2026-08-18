# Kopiko Wedding Studio — n8n + WhatsApp Automation

This document covers the automation layer added on top of the existing Next.js admin panel / booking system. **No existing UI, booking logic, or database schema was redesigned** — this is a pure extension:

- Next.js still owns the application, the admin panel, and MongoDB Atlas.
- n8n owns *scheduling* and *sending WhatsApp messages*.
- Next.js and n8n talk to each other over plain authenticated HTTP (webhooks).

---

## 1. Dependencies

**No new npm packages were installed.** Everything required was already available:

| Need | Used instead of installing... | Why |
|---|---|---|
| HTTP calls to n8n | native `fetch` (built into Node 18+/Next.js) | `axios` would be a duplicate — `fetch` already does everything needed (timeouts via `AbortController`, JSON, retries) |
| Date math (reminders, schedules) | `date-fns` (already a dependency) | `dayjs` would duplicate `date-fns`, which the project already uses elsewhere |
| Unique IDs | `crypto.randomUUID()` (built into Node) | avoids adding `uuid` |
| Scheduling | n8n's own **Schedule Trigger** node | per the spec, no `node-cron` inside Next.js |
| Env loading | Next.js's built-in `.env.local`/`.env` support | no `dotenv` needed |
| Validation | `zod` (already a dependency) | used for both the existing API routes and the new automation env/payload validation |

This keeps the project exactly as lightweight as before — zero duplicate packages, zero new `package.json` entries.

---

## 2. Environment Variables

Added to `.env.local` (all optional — the app runs perfectly fine with these empty; automation just no-ops and logs a warning):

```env
# Single n8n "Webhook" trigger URL that receives every event Next.js emits.
N8N_WEBHOOK_URL=

# Shared secret used in BOTH directions (Next.js -> n8n, and n8n -> Next.js)
AUTOMATION_API_SECRET=

# WhatsApp Cloud API (used by n8n's HTTP Request nodes + our verification endpoint)
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=

# Studio admin's own WhatsApp number (E.164, e.g. 91XXXXXXXXXX)
ADMIN_WHATSAPP_NUMBER=

# Public site URL for links inside WhatsApp messages
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Validation lives in `src/lib/env.ts` → `getAutomationEnv()` / `isAutomationConfigured()`. It never throws for missing automation vars (unlike the pre-existing `validateEnv()` for core vars like `MONGODB_URI`) — it just returns `""` and callers skip gracefully.

---

## 3. Architecture

```
                     ┌─────────────────────────┐
  Admin Panel  ───▶  │        Next.js          │
  (booking/crew      │  (source of truth: DB)  │
   CRUD as before)   └────────────┬────────────┘
                                  │
              ┌───────────────────┼────────────────────┐
              │  OUTGOING (push)                        │  PULL (n8n asks us)
              ▼                                          ▼
     after(response) fetch                     GET /api/automation/reminders
     POST N8N_WEBHOOK_URL                      GET /api/automation/reports
     { event, workflow, data }                 (Schedule Trigger workflows)
              │                                          │
              ▼                                          ▼
        ┌───────────────────────── n8n ─────────────────────────┐
        │  Webhook Trigger  ──Switch(event)──▶ per-workflow      │
        │  Schedule Trigger ──HTTP GET────────▶ loop results      │
        │        │                                                │
        │        └──HTTP Request──▶ WhatsApp Cloud API            │
        └──────────────────────────┬──────────────────────────────┘
                                    │ reports result
                                    ▼
                     POST /api/automation/log  (AutomationLog collection)
```

Key design decisions:

- **Next.js renders the message text.** Templates live in `src/lib/whatsappTemplates.ts` (plain TypeScript functions), not inside n8n Function nodes. This means anyone editing message copy touches one reviewable file instead of digging through n8n's UI, and it's covered by the same type checking as the rest of the app.
- **n8n only needs two building blocks per workflow**: a trigger (Webhook or Schedule) and an HTTP Request node to the WhatsApp Cloud API — plus an HTTP Request node back to `/api/automation/log`. This keeps every n8n workflow short and easy to maintain.
- **Automation never blocks the admin panel.** Every outgoing dispatch runs inside Next.js's [`after()`](https://nextjs.org/docs/app/api-reference/functions/after) API, which executes *after* the HTTP response has already been sent to the browser. Booking/crew CRUD always feels instant, regardless of whether n8n is slow, down, or unconfigured.
- **Nothing ever throws back to the caller.** `dispatchAutomationEvent()` in `src/services/n8n.ts` catches every failure, retries once, and always resolves `true`/`false` — booking creation/updates can never fail because of an automation problem.
- **MongoDB stays the single source of truth.** The pull endpoints (`/api/automation/reminders`, `/api/automation/reports`) query live data on every call — nothing is duplicated into a separate store.

---

## 4. What Got Added To The Codebase

| File | Purpose |
|---|---|
| `src/lib/env.ts` | Extended with `getAutomationEnv()` / `isAutomationConfigured()` |
| `src/lib/errors.ts` | Shared `getErrorMessage()` / `statusForError()` helpers |
| `src/lib/automationAuth.ts` | Shared-secret check for n8n ↔ Next.js requests |
| `src/lib/whatsappTemplates.ts` | All WhatsApp message copy, one function per workflow |
| `src/lib/automation.ts` | Payload builders, crew-assignment diffing, event emitters |
| `src/services/n8n.ts` | Outgoing webhook dispatcher (retry + logging, never throws) |
| `src/models/AutomationLog.ts` | Mongo collection for automation audit history |
| `src/app/api/automation/log/route.ts` | n8n reports results here (`POST`); admin can browse history (`GET`) |
| `src/app/api/automation/reminders/route.ts` | Pull endpoint: wedding/occasion/payment reminders |
| `src/app/api/automation/reports/route.ts` | Pull endpoint: today/tomorrow/weekly/monthly crew & admin reports |
| `src/app/api/webhooks/whatsapp/route.ts` | Meta's WhatsApp Cloud API verification + inbound event logging |

**Existing files that got a small, additive hook** (no behavior changed, just an extra `after(() => emit...())` call after the existing DB operation):

- `src/app/api/bookings/route.ts` (`POST`) → `emitBookingCreated`
- `src/app/api/bookings/[id]/route.ts` (`PATCH`/`DELETE`) → `emitBookingUpdated` / `emitBookingDeleted`
- `src/app/api/crew/route.ts` (`POST`) → `emitCrewMemberChanged("created", ...)`
- `src/app/api/crew/[id]/route.ts` (`PATCH`/`DELETE`) → `emitCrewMemberChanged("updated"/"deleted", ...)`
- `src/app/api/reviews/[id]/route.ts` (`PATCH`) → `emitReviewApproved` (only when `approved` flips `false → true`)

---

## 5. Outgoing Events (Next.js → n8n)

Every event is POSTed to the single `N8N_WEBHOOK_URL` as:

```json
{
  "event": "booking.created",
  "workflow": "booking",
  "timestamp": "2026-08-05T07:00:00.000Z",
  "data": { ...structured payload... }
}
```

Header `x-automation-secret` is included when `AUTOMATION_API_SECRET` is set.

| Event | Workflow | Fired when |
|---|---|---|
| `booking.created` | booking | New booking saved |
| `booking.confirmed` | booking | Status becomes `confirmed` (on create or update) → **Client booking confirmation (#1)** |
| `booking.updated` | booking | Any booking update |
| `booking.status_changed` | booking | `status` field changes |
| `booking.gallery_delivered` | delivery | Status becomes `all_delivered` → **Gallery delivery notification (#10)** |
| `booking.cancelled` | booking | Status becomes `cancelled` → **Internal admin notification (#11)** |
| `booking.payment_status_changed` | payment | `paymentStatus` changes |
| `booking.wedding_date_changed` | booking | `weddingDate` changes |
| `booking.deleted` | booking | Booking deleted → **Internal admin notification (#11)** |
| `crew.assigned` | crew | A crew member is newly assigned to a department/date (diffed automatically) → **Crew assignment (#2)** |
| `crew.created` / `crew.updated` / `crew.deleted` | crew | Crew Management CRUD |
| `review.approved` | delivery | A review's `approved` flips to `true` |

The **Booking Payload** (`buildBookingPayload()` in `src/lib/automation.ts`) matches the spec's required fields: booking ID, bride/groom name, phone, package, status, payment status, full `dateSchedules` (every event, per department: event type, location, lead*, crew, crew-bride, crew-groom), venue, location, notes, created/updated timestamps.

> \* **Note on "Lead" fields:** earlier in this project the Photography/Videography/Drone "Lead" UI fields were intentionally removed (crew-only assignment model). The database schema still has optional `photographyLead` / `videographyLead` / `droneLead` fields for backward compatibility, and the payload includes them (usually empty strings) — but there's no UI to set them anymore. If you want the "Lead" concept back in the payload with real data, that requires a separate UI change, which was explicitly out of scope here per "do not modify existing booking functionality."

### Crew assignment diffing

`diffNewCrewAssignments()` flattens every department/date/side crew slot into keys like `2026-01-05|Photography|bride|Ashif` and only fires `crew.assigned` for keys that are new compared to the previous version of the booking. This means editing an unrelated field never re-notifies crew who were already assigned, and only *newly added* names get a WhatsApp message. Each `crew.assigned` event resolves the crew member's phone number by matching their name against the **Crew Management** collection (`src/models/Crew.ts`) and includes a ready-to-send rendered `message`.

---

## 6. Pull Endpoints (n8n → Next.js)

Both require header `x-automation-secret: <AUTOMATION_API_SECRET>`.

### `GET /api/automation/reminders?type=...`

| `type` | Maps to spec | Description |
|---|---|---|
| `wedding` | #3 Upcoming Wedding Reminder | Bookings 30/15/7/3/1 days out |
| `wedding-day` | #5 Wedding Day Wishes | Bookings whose wedding is today |
| `occasion` | #6/#7/#8 Engagement / Pre-Wedding / Save The Date | Occasion-type events 3/1/0 days out |
| `payment` | #9 Payment Reminder | Bookings with `paymentStatus !== "paid"` and `remainingAmount > 0` |

Response: `{ type, count, results: [{ to, message, meta }] }` — ready for an n8n "Loop Over Items" → HTTP Request (WhatsApp) chain.

### `GET /api/automation/reports?range=...`

| `range` | Maps to spec | Description |
|---|---|---|
| `today-crew` | #4 Today's Assignment | Every crew member working today, one message each |
| `today-summary` | #12 Daily Production Summary | Admin-facing counts by occasion + total crew, today |
| `tomorrow` | #13 Tomorrow Schedule | Admin-facing list of tomorrow's bookings |
| `weekly` | #14 Weekly Schedule | Admin-facing list of the next 7 days |
| `monthly` (`&month=YYYY-MM` optional) | #15 Monthly Schedule | Admin-facing list of the whole month |

`today-summary` / `tomorrow` / `weekly` / `monthly` return a single pre-rendered `message` string (send straight to `ADMIN_WHATSAPP_NUMBER`); `today-crew` returns one `{ to, message }` per crew member.

### `POST /api/automation/log`

n8n calls this after every WhatsApp send attempt to record the outcome:

```json
{ "workflow": "crew", "event": "crew.assigned", "status": "success", "recipient": "9199...", "message": "..." }
```

Accepts a single object or an array (for batch reporting). `GET /api/automation/log` (admin-cookie protected, same auth as the rest of `/admin`) lets you browse recent automation activity — useful for building a future "Automation Logs" tab.

---

## 7. n8n Setup — Step By Step

### 7.1 Install & run n8n

```bash
npx n8n
# or, for a persistent instance:
docker run -it --rm -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```

Open `http://localhost:5678`.

### 7.2 Create the credentials

1. **HTTP Header Auth** credential named `Automation Secret` → header name `x-automation-secret`, value = your `AUTOMATION_API_SECRET`.
2. **HTTP Header Auth** credential named `WhatsApp Cloud API` → header name `Authorization`, value = `Bearer <WHATSAPP_ACCESS_TOKEN>`.

### 7.3 Booking Workflow (event-driven)

1. **Webhook** node → set path (this becomes your `N8N_WEBHOOK_URL`), method `POST`, and require the `Automation Secret` credential.
2. **Switch** node on `{{$json.event}}` with branches for `booking.created`, `booking.confirmed`, `booking.status_changed`, `booking.gallery_delivered`, `booking.cancelled`, `booking.payment_status_changed`, `booking.wedding_date_changed`, `booking.deleted`.
3. Each branch → **HTTP Request** node → `POST https://graph.facebook.com/v20.0/{{WHATSAPP_PHONE_NUMBER_ID}}/messages` with body:
   ```json
   {
     "messaging_product": "whatsapp",
     "to": "{{$json.data.booking.phone || $json.data.phone}}",
     "type": "text",
     "text": { "body": "{{$json.data.message || 'See booking payload'}}" }
   }
   ```
   *(Most "booking.*" events don't carry a pre-rendered `message` yet — for these, either add a Set node to compose text from `$json.data.booking`, or point them at `/api/automation/reminders`-style rendering. `crew.assigned`, `booking.confirmed`-via-reminders, etc. already include `message`.)*
4. Final node → **HTTP Request** → `POST {{NEXT_PUBLIC_SITE_URL}}/api/automation/log` with the `Automation Secret` credential, reporting `{ workflow, event, status, recipient, error }`.

### 7.4 Crew Workflow (event-driven)

Same Webhook trigger can be shared (use a **Switch** on `event` starting with `crew.`) or use a separate Webhook path. For `crew.assigned`, the payload already has a rendered `message` and `crewPhone` — just forward straight to WhatsApp.

### 7.5 Reminder / Greeting / Payment Workflows (scheduled, pull-based)

For each of these, create a **separate** n8n workflow:

| Workflow | Schedule Trigger | HTTP Request |
|---|---|---|
| Wedding Reminder | Daily 08:00 | `GET /api/automation/reminders?type=wedding` |
| Wedding Day Wishes | Daily 07:00 | `GET /api/automation/reminders?type=wedding-day` |
| Occasion Wishes (Engagement/Pre-Wedding/Save The Date) | Daily 08:00 | `GET /api/automation/reminders?type=occasion` |
| Payment Reminder | Daily 09:00 | `GET /api/automation/reminders?type=payment` |

Each workflow: **Schedule Trigger** → **HTTP Request** (GET, with `Automation Secret` credential) → **Split Out** (`results`) → **HTTP Request** (WhatsApp, using `{{$json.to}}` / `{{$json.message}}`) → **HTTP Request** (`POST /api/automation/log`).

### 7.6 Daily/Weekly/Monthly Report Workflows (scheduled, pull-based, admin-facing)

| Workflow | Schedule Trigger | HTTP Request |
|---|---|---|
| Today's Crew Assignment | Daily 07:30 | `GET /api/automation/reports?range=today-crew` (loop `results`) |
| Daily Production Summary | Daily 08:00 | `GET /api/automation/reports?range=today-summary` (single `message` → `ADMIN_WHATSAPP_NUMBER`) |
| Tomorrow Schedule | Daily 20:00 | `GET /api/automation/reports?range=tomorrow` → `ADMIN_WHATSAPP_NUMBER` |
| Weekly Schedule | Sunday 20:00 | `GET /api/automation/reports?range=weekly` → `ADMIN_WHATSAPP_NUMBER` |
| Monthly Schedule | 1st of month, 08:00 | `GET /api/automation/reports?range=monthly` → `ADMIN_WHATSAPP_NUMBER` |

### 7.7 Delivery Workflow

`booking.gallery_delivered` and `review.approved` both route through the Booking Workflow's Switch node (workflow tag `delivery`) — no separate n8n workflow strictly required, but you can split it out if you prefer one-workflow-per-concern.

---

## 8. WhatsApp Cloud API Configuration

1. Create a Meta App → add the **WhatsApp** product.
2. Grab your **Phone Number ID** and a (temporary or permanent) **Access Token** → put them in `.env.local` as `WHATSAPP_PHONE_NUMBER_ID` / `WHATSAPP_ACCESS_TOKEN`.
3. Under **Configuration → Webhook**, set the callback URL to `{{NEXT_PUBLIC_SITE_URL}}/api/webhooks/whatsapp` and the Verify Token to the same value as `WHATSAPP_VERIFY_TOKEN`. Click **Verify and Save** — this hits our `GET` handler, which echoes back `hub.challenge` when the token matches.
4. Subscribe to the `messages` webhook field if you want inbound message logging (already handled — every inbound event is stored in `AutomationLog` with `direction: "incoming"`, `workflow: "whatsapp-inbound"`).

---

## 9. Testing Guide

### Test the outgoing dispatcher without a real n8n instance

```bash
# Any HTTP endpoint that echoes back 200 works, e.g. https://webhook.site/<your-id>
# Set N8N_WEBHOOK_URL to that URL in .env.local, then:
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"brideName":"Test Bride","groomName":"Test Groom","phone":"+911234567890","email":"a@b.com","weddingDate":"2026-12-25","venue":"Test Venue"}'
```

Check webhook.site — you should see a `booking.created` (and `booking.confirmed`, since new bookings default to `status: "confirmed"`) POST arrive within a couple seconds.

### Test the pull endpoints directly

```bash
curl "http://localhost:3000/api/automation/reminders?type=wedding" \
  -H "x-automation-secret: <your secret>"

curl "http://localhost:3000/api/automation/reports?range=today-summary" \
  -H "x-automation-secret: <your secret>"
```

### Test the log endpoint

```bash
curl -X POST http://localhost:3000/api/automation/log \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: <your secret>" \
  -d '{"workflow":"crew","event":"crew.assigned","status":"success","recipient":"+911234567890"}'
```

### Test the WhatsApp verification handshake

```bash
curl "http://localhost:3000/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=<your token>&hub.challenge=12345"
# should return: 12345
```

---

## 10. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Nothing arrives in n8n | `N8N_WEBHOOK_URL` empty/unset | Set it in `.env.local` and restart the dev server |
| `401` from `/api/automation/*` | Missing/wrong `x-automation-secret` header | Match the header exactly to `AUTOMATION_API_SECRET` |
| n8n gets `403` calling `/api/webhooks/whatsapp` verification | `WHATSAPP_VERIFY_TOKEN` mismatch | Ensure the token in Meta's dashboard matches `.env.local` exactly |
| Booking save feels slow | n8n unreachable, causing retries | Automation runs in `after()` (post-response) for `after`-supported routes, so the *API response* should still be fast; if it isn't, check you're on the Node.js runtime (not Edge) — `after()` requires it, which is the default here |
| Crew member didn't get notified on assignment | Crew name in the booking doesn't exactly match a name in **Crew Management** | Names are matched by exact string equality — make sure crew were selected from the dropdown (not manually retyped) |
| Want to see what fired and what failed | Check `AutomationLog` collection | `GET /api/automation/log` (logged in as admin) or query MongoDB Atlas directly |

---

## 11. Security Notes

- All `/api/automation/*` pull endpoints and the log endpoint require `x-automation-secret`. Treat `AUTOMATION_API_SECRET` like a password — generate a long random string (e.g. `openssl rand -hex 32`).
- The WhatsApp webhook verification endpoint only ever echoes back `hub.challenge` when the verify token matches; it never exposes any secret.
- No credentials are hardcoded anywhere in the codebase — everything flows through `process.env` via `src/lib/env.ts`.
- `AutomationLog.payload` can contain booking PII (names/phone/email) — this collection lives in the same MongoDB Atlas instance as everything else, behind the same network/access controls you already have.

---

## 12. Future-Ready Extensions

The architecture was deliberately kept generic so these can be added without touching the core dispatch/logging logic:

- **Email** — add `src/lib/emailTemplates.ts` mirroring `whatsappTemplates.ts`, and either (a) let the *same* n8n workflows branch on a `channel` field, or (b) add a `SENDGRID_API_KEY`/`RESEND_API_KEY` env var and call it directly from an n8n **HTTP Request**/native Email node right next to the WhatsApp one.
- **Google Calendar** — add a step in the Booking Workflow's `booking.created`/`booking.updated` branches to call the Google Calendar API with the `dateSchedules` from the payload (already structured per-date, per-event).
- **Google Drive** — hook into `booking.gallery_delivered` to create a shared folder link, then feed that URL into `renderGalleryDeliveryNotification(couple, galleryUrl)`.
- **SMS / Slack / Telegram / Discord** — same idea as Email: n8n already receives every event; adding another HTTP Request/native node per channel requires zero changes to Next.js.

None of these require new webhook plumbing — the events and payloads already emitted cover all of them.
