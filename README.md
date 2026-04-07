# Civia — Platforma civică a României

Platformă civică independentă pentru cetățenii din România. Sesizări cu AI, calitatea aerului live, hărți, statistici și ghiduri civice pentru toate cele 42 de județe.

**Live**: [civia.ro](https://civia.ro)

## Stack tehnic

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Bază de date**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **AI**: Groq (Llama 3.3 70B pentru text formal, Llama 3.1 8B pentru clasificare)
- **Hărți**: Leaflet + react-leaflet cu date OSM reale
- **Styling**: Tailwind CSS v4 cu CSS variables (dark mode complet)
- **Email**: Resend
- **Rate limiting**: Upstash Redis
- **Analytics**: Plausible (privacy-friendly)
- **Erori**: Sentry
- **Deploy**: Vercel

## Funcționalități principale

- **Sesizări cu AI** — Descrii problema, AI-ul generează o sesizare formală conform OG 27/2002
- **Calitate aer live** — Hartă cu sute de senzori (Sensor.Community, OpenAQ, WAQI), heatmap IDW
- **42 județe** — Fiecare județ are: sesizări, aer, hărți, statistici, știri, ghiduri, autorități, bilete, impact, evenimente, istoric, cum funcționează administrația
- **Știri agregate** — RSS din Digi24, Hotnews, G4Media, B365, cu tagging per județ
- **Hărți mobilitate** — Piste biciclete, metrou, STB, zone pietonale (București)
- **Ghiduri** — 6 ghiduri complete: cetățean, sesizări, biciclist, vară, cutremur, transport
- **PWA** — Instalabil pe mobil cu service worker

## Setup local

```bash
git clone https://github.com/andrei/civic-bucuresti.git
cd civic-bucuresti
npm install
cp .env.local.example .env.local
# Completează variabilele din .env.local
npm run dev
```

### Variabile de mediu necesare

| Variabilă | Descriere |
|-----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL-ul proiectului Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cheia anonimă Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Cheia de serviciu (server-only) |
| `GROQ_API_KEY` | API key pentru Groq AI |
| `UPSTASH_REDIS_REST_URL` | URL Redis pentru rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Token Redis |
| `CRON_SECRET` | Secret pentru cron job-uri Vercel |

Opțional: `RESEND_API_KEY`, `OPENAQ_API_KEY`, `WAQI_TOKEN`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `NEXT_PUBLIC_SENTRY_DSN`

## Structură

```
src/
  app/                    # Next.js App Router pages
    [judet]/              # 14 pagini per județ × 42 județe
    api/                  # 35+ API endpoints
  components/             # React components
  data/                   # Date statice (statistici, evenimente, ghiduri)
  lib/                    # Utilități, Supabase, AI, email
  types/                  # TypeScript interfaces
supabase/
  migrations/             # 12 migrații SQL
public/
  geojson/                # Date OSM pentru hărți București
```

## Date și surse

- **Populație**: INS Recensământ 2021
- **Accidente rutiere**: DRPCIV 2023 (estimări proporționale per județ)
- **Calitate aer**: ANPM / calitateaer.ro (medii anuale)
- **Primari**: BEC, alegeri locale 2024
- **Transport**: Site-uri oficiale operatori

**Notă**: Datele despre accidente și sesizări per județ sunt estimări bazate pe totaluri naționale, nu statistici oficiale detaliate per județ.

## Contribuie

Vezi [civia.ro/contribuie](https://civia.ro/contribuie) pentru cum poți ajuta cu:
- Emailuri oficiale ale primăriilor
- Verificarea datelor existente
- Raportarea erorilor
- Pull requests pe GitHub

## Licență

Open-source. Codul este disponibil pentru audit și contribuții.
