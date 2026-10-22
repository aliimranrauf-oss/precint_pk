# Precinct.pk: Project Master File

Bahria Town Karachi ka number 1 property platform. Customers ke liye free, agents se subscription.
Yeh file har phase ke baad update karo, taake pata rahe kya ban chuka aur kya baqi hai.

## Phase status

| Phase | Kaam | Status |
|---|---|---|
| 1 | Public website: homepage, listings, precinct pages, listing detail, demo chatbot | ✅ Done |
| 2 | Agent login, dashboard, listing upload + photos, admin approve (Verified), reports, 14 din expiry | ✅ Code ready (Supabase SQL chalana baqi) |
| 3 | Chatbot (Claude API) + lead capture + agent Leads dashboard | ⬜ Next |
| 4 | Real maps (Leaflet + OpenStreetMap), precinct pins, rate tracker (real data), ROI calculator | ⬜ |
| 5 | Verification automation: expiry reminders, price-anomaly review, agent score, phone OTP, spam protection | ⬜ |
| 6 | Paisa: featured listings, agent plans, payments (JazzCash/Easypaisa/bank), Vercel Pro + Supabase Pro | ⬜ |
| 7 | Growth: SEO (sitemap, precinct pages), WhatsApp API, price alerts, rentals, home services, Urdu UI | ⬜ |

Details: `docs/PHASE-1.md`, `docs/PHASE-2.md`. Baqi phases ka plan neeche hai.

## Stack (har cheez)

| Kaam | Tool | Kharcha |
|---|---|---|
| Code ka ghar | GitHub (private repo `precinct-pk`) | Free |
| Hosting | Vercel (auto deploy har `git push` par) | Free testing ke liye; paid users ke baad Pro ~$20/mahina |
| Framework | Next.js 14 (App Router) + React 18 + TypeScript | Free |
| Database + Login + Photos | Supabase (Postgres, Auth, Storage) | Free; live hone par Pro ~$25/mahina |
| Session/login helper | `@supabase/ssr` | Free |
| Design | Plain CSS (`app/globals.css`), mobile pehle, dark mode | Free |
| Domain | precinct.pk | Saalana kuch hazaar Rs. |
| Phase 3 AI | Claude API (Anthropic) | Per message, limit lagana |
| Phase 4 maps | Leaflet + OpenStreetMap | Free |
| Phase 5 spam | Cloudflare Turnstile | Free |
| Phase 5 email | Resend | Free limit |
| WhatsApp (abhi) | `wa.me` link | Free |

Note: Vercel Hobby plan commercial use ke liye nahi hota. Agents se paisa lene se pehle Pro lo.

## Folder map

```
app/
  page.tsx                  homepage
  layout.tsx                header/footer/chatbot
  listings/page.tsx         /listings (filters)
  listing/[id]/page.tsx     listing detail + Report
  listing/[id]/actions.ts   report action
  [precinct]/page.tsx       /10a /11b /27 /31
  login/page.tsx            login + agent signup
  dashboard/page.tsx        agent dashboard
  dashboard/new/page.tsx    nayi listing form
  dashboard/actions.ts      create listing, sold, still available
  admin/page.tsx            approve/reject + reports (sirf admin)
  admin/actions.ts
  auth/signout/route.ts     logout
components/                 Header, Footer, SearchBox, ListingCard, Chatbot, NewListingForm
lib/
  data.ts                   listings fetch, sample data, price format
  agent.ts                  agent profile helper
  supabase.ts               public (anon) client
  supabase/server.ts, client.ts   login-aware clients
middleware.ts               /dashboard aur /admin ko login ke peeche rakhta hai
supabase/schema.sql         Phase 1 tables
supabase/phase2.sql         Phase 2 migration (run karna zaroori)
docs/                       phase wise notes
```

## Database (Supabase)

- `agents`: id (= auth user), name, phone, office_address, verified, is_admin, score
- `listings`: agent_id, agent_name, phone, precinct, type, title, description, price, photos[], verified, status (pending/active/sold/hidden), confirmed_at
- `leads`: agent_id, listing_id, name, phone, budget, note, status (new/contacted/visit/deal). Phase 3 mein use hogi
- `reports`: listing_id, reason (not_available/rate_different)
- Storage bucket: `listing-photos` (public read, agent sirf apne folder mein upload)

## Environment variables (Vercel + `.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ANTHROPIC_API_KEY        # Phase 3 (sirf server par, kabhi NEXT_PUBLIC_ nahi)
```
`.env.local` GitHub par kabhi nahi jati. `service_role` key kabhi frontend mein nahi.

## Business rules (platform ki taqat)

1. Naya listing hamesha "Review mein" jati hai. Admin call karke confirm kare, phir Approve = Verified.
2. Agent khud `verified` ya `status = active` set nahi kar sakta (database trigger rokta hai).
3. Listing 14 din baad public site se hat jati hai jab tak agent "Still available" na dabaye.
4. 3 customer reports par listing khud hide.
5. Disclaimer har page par: "Independent platform. Bahria Town (Pvt) Ltd se koi taluq nahi."
6. Bahria Town ka logo/rang use nahi karna.

## Baqi phases ka plan

**Phase 3: Chatbot + Leads** (1-2 hafte)
- `/api/chat` route jo Claude API ko call kare (key sirf server par)
- System prompt: Roman Urdu/Urdu/English, sirf Bahria Town Karachi, rate nahi pata to agent se milwao, jhoota rate na bataye
- Naam, number, budget poochna, phir `leads` table mein save
- Agent dashboard mein `/dashboard/leads` (status: New → Contacted → Visit → Deal)
- Rozana message limit (kharcha control) aur Turnstile

**Phase 4: Maps + Rates**
- Leaflet map listings page par, har listing ka pin
- Har precinct ka polygon (GeoJSON), haath se draw
- `rates` table, weekly rate entry, `/rates` page chart, ROI calculator `/calculator`

**Phase 5: Trust automation**
- Vercel Cron: 7 din baad agent ko reminder, 14 din baad hide
- Market rate se 30% sasti listing automatically "Review" mein
- Agent score: reports se kam, accurate listings se zyada
- Phone OTP, CNIC/office verification form

**Phase 6: Paisa**
- Plans: Free (3 listings), Pro (CRM + chatbot + zyada listings), Featured boost
- Payment: bank transfer/JazzCash/Easypaisa se shuru (haath se activate), baad mein gateway
- Vercel Pro + Supabase Pro par shift

**Phase 7: Growth**
- Sitemap, har precinct ka SEO page, YouTube/TikTok content
- Price alerts, saved listings, WhatsApp Business API
- Rental management, home services, society app
- Urdu interface

## Asli kaam jo code se bahar hai

- Pehle 50 agents aur 500 listings jama karo
- Pehli 100 listings khud verify karo
- Naam ke saath trademark/lawyer se ek baar salah lo
