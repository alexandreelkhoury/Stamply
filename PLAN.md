# Stamply — Digital Loyalty Platform

## Product Vision

SaaS platform that digitizes loyalty cards for small/medium businesses (cafes, restaurants, salons). Replace physical punch cards with wallet passes that are faster, trackable, and impossible to lose.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Language** | TypeScript (everywhere) | One language, shared types, no context switching |
| **Framework** | Next.js 15 (App Router) | Full-stack: SSR dashboard + API routes + PWA |
| **Database** | PostgreSQL (via Prisma ORM) | Relational data fits perfectly, great tooling |
| **Cache/Rate Limit** | Redis (Upstash) | Rate limiting scans, session cache |
| **Auth** | NextAuth.js v5 | Merchant auth only. Customers don't need auth. |
| **SMS** | Twilio | Wallet pass delivery to customers |
| **Payments** | Stripe | Merchant subscriptions ($10/month) |
| **Storage** | Cloudflare R2 / S3 | Logos, pass assets |
| **Hosting** | Vercel | Fast deploys, edge functions, PWA support |
| **Pass Generation** | `passkit-generator` + Google Wallet API | Server-side wallet pass creation |
| **Styling** | Tailwind CSS + shadcn/ui | Fast, consistent, accessible UI |
| **QR Scanning** | `html5-qrcode` (browser) | No native app needed, works in PWA |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
│                                                          │
│  ┌────────────────────┐   ┌───────────────────────────┐ │
│  │  Merchant PWA       │   │  Customer Touch Points    │ │
│  │  (Next.js App)      │   │                           │ │
│  │  - Dashboard        │   │  - SMS → Wallet pass      │ │
│  │  - QR Scanner       │   │  - Apple/Google Wallet    │ │
│  │  - Analytics        │   │  - Web fallback (no app)  │ │
│  └────────┬───────────┘   └────────────┬──────────────┘ │
└───────────┼────────────────────────────┼────────────────┘
            │                            │
            ▼                            ▼
┌─────────────────────────────────────────────────────────┐
│                  API LAYER (Next.js API Routes)          │
│                                                          │
│  /api/auth/*       /api/stamps/*      /api/passes/*     │
│  /api/programs/*   /api/customers/*   /api/webhooks/*   │
└──────────────────────────┬──────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
  ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
  │  PostgreSQL   │ │   Redis      │ │  Object Store│
  │  (Prisma ORM) │ │  (Upstash)   │ │  (R2/S3)     │
  └──────────────┘ └─────────────┘ └──────────────┘
          │
          ▼
  ┌──────────────────────────────────┐
  │  External Services               │
  │  - Apple APNs (pass updates)     │
  │  - Google Wallet API             │
  │  - Twilio SMS                    │
  │  - Stripe billing                │
  └──────────────────────────────────┘
```

---

## Database Schema

### merchants
- id (UUID, PK)
- email (unique)
- password_hash
- business_name
- phone
- logo_url
- address, city
- stripe_customer_id
- subscription_status (trial | active | cancelled | past_due)
- trial_ends_at
- created_at

### programs
- id (UUID, PK)
- merchant_id (FK → merchants)
- name
- stamps_required (int)
- reward_text
- is_active (bool)
- card_color, text_color
- icon_url
- created_at

### customers
- id (UUID, PK)
- phone (unique, E.164)
- name (optional)
- created_at

### cards
- id (UUID, PK)
- customer_id (FK → customers)
- program_id (FK → programs)
- current_stamps (int)
- total_stamps (int)
- rewards_earned (int)
- qr_code (unique, indexed — short random string)
- apple_pass_serial, apple_push_token
- google_pass_id
- created_at
- UNIQUE(customer_id, program_id)

### stamps (append-only audit log)
- id (UUID, PK)
- card_id (FK → cards)
- merchant_id (FK → merchants)
- stamp_type ('stamp' | 'reward_redeemed')
- created_at

---

## Key UX Flows

### Merchant Onboarding (< 3 min)
1. Sign up: email + password + business name
2. Upload logo (or skip)
3. Set reward: "Buy [8] → Get [free coffee]"
4. Pick card color → Preview → Done
5. Dashboard ready, scanner one tap away

### Customer Gets Card (< 30 sec)
1. Merchant asks for phone number
2. Types it into PWA
3. System sends SMS: "Your loyalty card is ready! Add to wallet: https://stmp.ly/abc123"
4. Customer taps → adds to Apple/Google Wallet
5. Pass shows QR + "0/8 stamps"

### Checkout Scan (< 3 sec)
1. Customer opens wallet pass (shows QR)
2. Merchant taps SCAN on PWA
3. Camera reads QR → instant confirmation sound + visual
4. "Sarah — 5/8 stamps ███████░░" → auto-dismiss
5. If reward earned: celebration animation + "FREE COFFEE!"

---

## Critical Path: Stamp API (< 100ms)

```
POST /api/stamps { qr_code }
1. Lookup card by qr_code (indexed)
2. Redis rate limit check (1 stamp/card/15min)
3. Verify merchant owns the program
4. Transaction: INSERT stamp + UPDATE card count
5. If stamps >= required: reset + increment rewards
6. Set Redis rate limit key
7. Async: push wallet pass update
8. Return confirmation
```

---

## Fraud Prevention

| Threat | Mitigation |
|--------|------------|
| Double-scan | Redis: 1 stamp per card per 15 min |
| Self-stamping | Audit log + anomaly flags |
| QR copied | Only works with authenticated merchant scan |
| Fake QR | Lookup fails → "Card not found" |
| Fake customers | Phone number required (SMS verification) |

---

## V1 Scope (2-3 weeks)

### IN
- Merchant signup + dashboard
- One loyalty program per merchant
- Phone-number customer cards
- QR scanning via PWA camera
- SMS with wallet pass link
- Apple Wallet + Google Wallet passes
- Basic analytics
- Stripe billing (14-day trial)

### NOT IN V1
- Multiple programs per merchant
- Customer accounts/profiles
- Push notifications to customers
- Advanced analytics/exports
- Multi-location support
- POS integration

---

## Cost at 100 Merchants

| Service | Cost/month |
|---------|-----------|
| Vercel | $20 |
| Supabase/Neon (Postgres) | $25 |
| Upstash Redis | $10 |
| Twilio SMS | ~$50 |
| Apple Developer | $8 ($99/yr) |
| Cloudflare R2 | ~$5 |
| **Total** | **~$120** |
| **Revenue** (100 × $10) | **$1,000** |

---

## Go-To-Market (Beirut)

1. **Week 1-2:** Walk into 30 cafes in Hamra/Mar Mikhael, set up for free on the spot
2. **Week 3-6:** Track repeat visits, build case studies with real numbers
3. **Month 2-4:** Merchant referral program (refer → 1 month free), Instagram presence
4. **Pricing:** Consider $5/month for Lebanese market (price-sensitive)
