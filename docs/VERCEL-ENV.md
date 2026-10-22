# Vercel mein Environment Variables kaise daalein

## Pehle Supabase se keys lo
1. supabase.com → apna project kholo.
2. Left menu mein **Project Settings** (gear icon) → **API** (naye dashboard mein "API Keys" / "Data API" bhi likha hota hai).
3. Do cheezein copy karo:
   - **Project URL** (jaise `https://abcd1234.supabase.co`) → yeh `NEXT_PUBLIC_SUPABASE_URL` hai
   - **anon public** key (naye naam mein "publishable key") → yeh `NEXT_PUBLIC_SUPABASE_ANON_KEY` hai
4. **service_role / secret key kabhi copy ya paste mat karo**, is project ko iski zaroorat nahi.

## Phir Vercel mein daalo
1. vercel.com → apna project `precinct-pk` kholo.
2. Upar **Settings** → left menu mein **Environment Variables**.
3. Pehli variable:
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Supabase wala Project URL
   - Environments: **Production, Preview, Development** teeno tick rakho
   - **Save** dabao
4. Doosri variable:
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: anon public key
   - Save
5. **Redeploy zaroori hai** (purane build mein nayi keys nahi hoti): Vercel → **Deployments** → sabse upar wali deployment ke teen dots (⋯) → **Redeploy**.

## Gemini key (aakhir mein)
Google AI Studio (aistudio.google.com) → API keys se key lo, phir Vercel mein:
- Key: `GEMINI_API_KEY` (aage `NEXT_PUBLIC_` **nahi** lagana, warna key sab ko nazar aa jayegi)
- Value: aapki key
- Save, phir Redeploy
Model ka naam default `gemini-2.5-flash-lite` hai. Agar aapke account mein naam alag ho to `GEMINI_MODEL` variable bana kar sahi naam daal do (AI Studio mein model list dekho).

## Apne computer par (npm run dev)
Project folder mein `.env.local` file banao (`.env.example` ki copy) aur wahi values daalo. Dev server restart karo. `.env.local` GitHub par kabhi nahi jati.

## Aam galtiyan
- Key daali magar site par asar nahi: Redeploy nahi kiya.
- Login kehta hai "keys set nahi hain": `NEXT_PUBLIC_` ka naam ghalat likha ya extra space.
- Chatbot kehta hai "setup ho raha hai": `GEMINI_API_KEY` nahi mili (Production tick? Redeploy?).
