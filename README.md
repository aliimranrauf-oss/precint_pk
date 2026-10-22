# Precinct.pk

Bahria Town Karachi property platform. Next.js 14 + Supabase + Vercel.

## Computer par chalane ke liye
1. Node.js (v18+) install karo.
2. `npm install`
3. `.env.example` ko copy karke `.env.local` banao (Supabase keys baad mein, abhi khali chhor sakte ho, sample data chalega).
4. `npm run dev` phir http://localhost:3000 kholo.

## Supabase
1. supabase.com par naya project banao.
2. SQL Editor mein `supabase/schema.sql` paste karke Run karo.
3. Project Settings -> API se URL aur anon key `.env.local` mein daalo.

## GitHub + Vercel
1. GitHub par private repo `precinct-pk` banao aur yeh sari files upload/push karo (`.env.local` kabhi nahi).
2. Vercel -> Add New -> Project -> repo chuno -> Environment Variables mein 2 Supabase keys daalo -> Deploy.
3. Vercel -> Settings -> Domains mein `precinct.pk` jodo.

## Agla kaam
Agent login (Supabase Auth), listing upload form, admin verify page, chatbot (Claude API) aur leads dashboard.
