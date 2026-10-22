# Phase 2: Agents, uploads, verification ✅ (code), setup baqi

## Kya bana
- `/login`: agent signup (naam, phone, email, password) aur login
- `/dashboard`: apni listings, status (Review mein / Live / Sold), "Still available", "Sold", logout
- `/dashboard/new`: listing form + 4 tak photos (browser mein compress hoke Supabase Storage mein)
- `/admin`: pending listings approve (Verified badge) ya reject, customer reports ki list
- Listing page par "Report karein" (Available nahi / Rate alag)
- 14 din expiry: public site sirf pichle 14 din mein confirm hui listings dikhati hai
- Security: `/dashboard` aur `/admin` login ke peeche; agent khud verify/publish nahi kar sakta

## Setup (ek baar, zaroori)

1. **Supabase SQL:** pehle `supabase/schema.sql` (agar nahi chalaya), phir `supabase/phase2.sql` SQL Editor mein Run karo.
2. **Supabase Auth:** Authentication → Providers → Email. Testing ke liye "Confirm email" band kar do (baad mein on karna behtar hai).
3. **Supabase Auth URL:** Authentication → URL Configuration mein Site URL = `https://precinct.pk` (aur Vercel preview URL).
4. **Vercel env:** `NEXT_PUBLIC_SUPABASE_URL` aur `NEXT_PUBLIC_SUPABASE_ANON_KEY` daal kar Redeploy.
5. **Khud ko admin banao:** `/login?mode=signup` se account banao, ek baar `/dashboard` kholo, phir SQL Editor mein (apni email ke saath):
   `update agents set is_admin = true where id = (select id from auth.users where email = 'you@example.com');`

## Test checklist
- [ ] Agent account banao, login ho
- [ ] Nayi listing + photo bhejo, dashboard mein "Review mein" dikhe
- [ ] Public site par abhi wo listing nahi dikhni chahiye
- [ ] Admin se `/admin` kholo, Approve karo
- [ ] Ab public site par "✔ Verified" ke saath dikhe
- [ ] Doosre account se listing report karo 3 baar, listing hide ho jaye
- [ ] Agent "Sold" dabaye, public se hat jaye

## Dhyan
- Supabase mein koi `status = 'active'` listing hogi to sample data nahi dikhega, sirf asli. Agar koi asli listing na ho to homepage khali dikhega (ya "Abhi koi listing nahi"). Shuru mein 2-3 listing approve kar lo.
- Reports abhi bina spam rokay hain, Phase 5 mein Turnstile lagega.
- Photos: Supabase free storage chhoti hai, isi liye photos compress hoti hain (~200KB).

## Baqi (Phase 2 se)
Agent profile edit, listing edit, CNIC verification form, email notifications.
