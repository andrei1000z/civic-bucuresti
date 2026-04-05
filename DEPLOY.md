# Civia — Deployment & Configuration Guide

## 1. Environment variables (Vercel)

Set these in **Vercel Dashboard → Project Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<your-project>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (anon public key) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` (service_role secret) |
| `GROQ_API_KEY` | `gsk_...` |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` |
| `GROQ_MODEL_FAST` | `llama-3.1-8b-instant` |
| **`NEXT_PUBLIC_SITE_URL`** | **`https://civia.ro`** ⚠️ must be set correctly |
| `CRON_SECRET` | Long random string (used by Vercel Cron for /api/stiri/fetch) |

`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `NEXT_PUBLIC_SENTRY_DSN`, `RESEND_API_KEY` are optional.

---

## 2. Database migrations

Run these in Supabase Dashboard → SQL Editor, in order:

1. `supabase/schema.sql` (base schema)
2. `supabase/migrations/002_stiri_cache.sql`
3. `supabase/migrations/003_expanded_tipuri.sql`
4. `supabase/migrations/004_profiles_extended.sql`
5. `supabase/migrations/005_sesizari_resolved.sql`
6. `supabase/migrations/006_security_newsletter_role.sql` — **adds role column + newsletter_subscribers table + RLS hardening**
7. `supabase/migrations/007_sesizare_follows.sql` — **adds follow feature**

All migrations are **idempotent**: safe to re-run.

### Make yourself admin

After running migration 006:

```sql
update public.profiles set role = 'admin' where id = '<your-user-id>';
```

Get your user ID from Supabase Dashboard → Authentication → Users.

---

## 3. Supabase Auth configuration

Go to **Supabase Dashboard → Authentication → URL Configuration**:

- **Site URL:** `https://civia.ro`
- **Redirect URLs:**
  - `https://civia.ro/auth/callback`
  - `http://localhost:3000/auth/callback` (for local dev)

### Enable Google OAuth

1. **Google Cloud Console** → create OAuth 2.0 Client ID (Web application)
2. Add authorized redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
3. Copy **Client ID** + **Client Secret**
4. **Supabase Dashboard → Authentication → Providers → Google** → paste them + Enable

### Enable Apple Sign-In

1. **Apple Developer Portal** → Create a Services ID
2. Configure Sign In with Apple → add domain: `<your-project>.supabase.co`
3. Add return URL: `https://<your-project>.supabase.co/auth/v1/callback`
4. Create a Key, download .p8 file, note Key ID
5. **Supabase Dashboard → Authentication → Providers → Apple** → paste Services ID + Key ID + Team ID + .p8 contents + Enable

### Email templates (magic link)

Supabase Dashboard → Authentication → Email Templates → edit "Magic Link":

```html
<h2>Bun venit pe Civia</h2>
<p>Apasă linkul de mai jos pentru a te conecta:</p>
<p><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 24px;background:#1C4ED8;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Conectează-mă</a></p>
<p style="color:#64748b;font-size:14px;">Linkul expiră în 1 oră. Dacă nu ai cerut acest email, ignoră-l.</p>
<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
<p style="color:#94a3b8;font-size:12px;">Civia — platforma civică a Bucureștiului · civia.ro</p>
```

---

## 4. Vercel Cron (RSS refresh)

Create `vercel.json` in the repo root:

```json
{
  "crons": [
    {
      "path": "/api/stiri/fetch",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

Vercel Cron automatically sends `Authorization: Bearer $CRON_SECRET` — the route authorizes via this header.

---

## 5. Production build checklist

```bash
npm install
npm run lint                    # 0 errors, ≤4 known warnings
npm run build                   # bundle should succeed
npm run dev                     # smoke test
```

Smoke test checklist:
- [ ] `/` loads, news cards clickable, NearMe widget works
- [ ] `/impact` shows before/after gallery (if data exists)
- [ ] `/sesizari/<code>` shows Follow button + Share menu
- [ ] Click Follow → toast "Urmărești sesizarea"
- [ ] Click Share → dropdown opens, Escape closes
- [ ] `/cont` → "Șterge contul" opens styled modal (not browser confirm)
- [ ] Auth modal shows Google + Apple buttons + email
- [ ] Submit a sesizare → formal email doesn't include "Cod platformă Civia"
- [ ] `/statistici` → Export CSV button downloads file
- [ ] `/stiri` empty state has no dev debug message

---

## 6. DNS (civia.ro → Vercel)

Your domain is registered at RoTLD with nameservers only. Easiest path:

1. Create a free Cloudflare account
2. Add `civia.ro` to Cloudflare → get Cloudflare nameservers
3. Go to RoTLD → update nameservers to Cloudflare's
4. In Cloudflare DNS, add:
   - `A` record: `@` → `76.76.21.21` (Vercel's edge)
   - `CNAME`: `www` → `cname.vercel-dns.com`
5. In Vercel → Project → Domains → add `civia.ro` and `www.civia.ro`

Propagation takes 1-24h.
