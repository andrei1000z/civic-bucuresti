"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Locate,
  Copy,
  Mail,
  Send,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { SESIZARE_TIPURI, SECTOARE } from "@/lib/constants";
import { getAuthoritiesFor } from "@/lib/sesizari/authorities";
import { detectGen, subsemnatulForm, domiciliatForm } from "@/lib/sesizari/gen";
import { cn } from "@/lib/utils";
import { PhotoUploader } from "./PhotoUploader";
import { buildMailtoLink } from "@/lib/sesizari/mailto";
import { useAuth } from "@/components/auth/AuthProvider";
import { EmailChoicePanel } from "./EmailChoicePanel";

interface FormData {
  nume: string;
  adresa: string;
  email: string;
  tip: string;
  titlu: string;
  locatie: string;
  sector: string;
  lat: number | null;
  lng: number | null;
  descriere: string;
  formal_text: string;
  publica: boolean;
}

const INITIAL: FormData = {
  nume: "",
  adresa: "",
  email: "",
  tip: "",
  titlu: "",
  locatie: "",
  sector: "",
  lat: null,
  lng: null,
  descriere: "",
  formal_text: "",
  publica: true,
};

export function SesizareForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<FormData>(INITIAL);
  const [imagini, setImagini] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ code: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [honey, setHoney] = useState(""); // anti-bot honeypot
  const classifyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setError(null);
  };

  // Auto-fill from profile (auth) or localStorage (anonymous)
  useEffect(() => {
    if (profileLoaded) return;
    if (user) {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((j) => {
          if (j.data) {
            // Prefer full_name (real name for sesizari). Skip display_name if it's the
            // auto-generated email prefix (Supabase trigger default).
            const emailPrefix = (j.data.email as string | undefined)?.split("@")[0] ?? "";
            const displayNameIsEmailPrefix =
              j.data.display_name && j.data.display_name === emailPrefix;
            const preferredName =
              j.data.full_name ||
              (!displayNameIsEmailPrefix ? j.data.display_name : "") ||
              "";
            setData((d) => ({
              ...d,
              nume: d.nume || preferredName,
              adresa: d.adresa || j.data.address || "",
              email: d.email || j.data.email || "",
            }));
          }
          setProfileLoaded(true);
        })
        .catch(() => setProfileLoaded(true));
    } else if (typeof window !== "undefined") {
      const saved = localStorage.getItem("civic_user_data");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setData((d) => ({
            ...d,
            nume: d.nume || parsed.name || "",
            adresa: d.adresa || parsed.address || "",
            email: d.email || parsed.email || "",
          }));
        } catch {
          // ignore
        }
      }
      setProfileLoaded(true);
    }
  }, [user, profileLoaded]);

  // Debounced auto-classify (runs when tip or sector missing)
  useEffect(() => {
    if (data.descriere.length < 20 || (data.tip && data.sector)) return;
    if (classifyTimerRef.current) clearTimeout(classifyTimerRef.current);
    classifyTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/ai/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data.descriere + " " + data.locatie }),
        });
        if (!res.ok) return;
        const json = await res.json();
        setData((d) => ({
          ...d,
          tip: d.tip || json.data?.tip || d.tip,
          sector: d.sector || json.data?.sector || d.sector,
        }));
      } catch {
        // silent fail
      }
    }, 800);
    return () => {
      if (classifyTimerRef.current) clearTimeout(classifyTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.descriere, data.locatie]);

  const handleAIImprove = async () => {
    if (data.descriere.length < 10) {
      setError("Scrie mai întâi o descriere (min 10 caractere)");
      return;
    }
    if (!data.tip) {
      setError("Alege tipul problemei — AI folosește un template specific pe tip");
      return;
    }
    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descriere: data.descriere,
          tip: data.tip,
          locatie: data.locatie,
          nume: data.nume,
          adresa: data.adresa,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "AI eroare");
      // AI only updates formal_text — NOT titlu/descriere (user's input preserved)
      setData((d) => ({ ...d, formal_text: json.data.formal_text }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI temporar indisponibil");
    } finally {
      setAiLoading(false);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocația nu e disponibilă în browser");
      return;
    }
    setGeoLoading(true);
    setError(null);

    let reverseCalled = false;
    let lastAccuracy = Infinity;
    let hasAnyPosition = false;
    const target = 15; // meters — stop refining when we reach GPS precision
    setGpsAccuracy(null);

    // Reverse geocode once we have a reasonable first fix (< 100m accuracy)
    const maybeReverseGeocode = async (lat: number, lng: number) => {
      if (reverseCalled) return;
      reverseCalled = true;
      try {
        const res = await fetch(`/api/geocoding?lat=${lat}&lng=${lng}`);
        const json = await res.json();
        if (json.data) {
          setData((d) => ({
            ...d,
            locatie: d.locatie || json.data.address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            sector: d.sector || json.data.sector || d.sector,
          }));
        } else {
          setData((d) => ({ ...d, locatie: d.locatie || `${lat.toFixed(5)}, ${lng.toFixed(5)}` }));
        }
      } catch {
        setData((d) => ({ ...d, locatie: d.locatie || `${lat.toFixed(5)}, ${lng.toFixed(5)}` }));
      }
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        hasAnyPosition = true;
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy;

        // Only update if this fix is more precise than the last one
        if (acc < lastAccuracy) {
          lastAccuracy = acc;
          setData((d) => ({ ...d, lat, lng }));
          setGpsAccuracy(acc);

          // First time we get a reasonable fix, do reverse geocode
          if (acc < 200) maybeReverseGeocode(lat, lng);

          // Reached target precision — stop watching
          if (acc <= target) {
            navigator.geolocation.clearWatch(watchId);
            setGeoLoading(false);
          }
        }
      },
      (err) => {
        navigator.geolocation.clearWatch(watchId);
        setGeoLoading(false);
        if (!hasAnyPosition) {
          if (err.code === 1) {
            setError("Permisiune refuzată — activează locația în setările browserului.");
          } else if (err.code === 2) {
            setError("Locație indisponibilă — verifică dacă e activată locația în browser.");
          } else {
            setError("Timeout — reîncearcă, sau introdu locația manual.");
          }
        }
      },
      {
        enableHighAccuracy: true, // use GPS for max precision
        timeout: 20000, // 20s max wait for high-precision fix
        maximumAge: 0, // always fresh reading
      }
    );

    // Safety: after 12s, stop watching even if we haven't hit target accuracy
    // (user doesn't want to wait forever; we use whatever best fix we got)
    setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
      setGeoLoading(false);
      if (!hasAnyPosition) {
        setError("Timeout — nu am putut obține locația. Introdu-o manual.");
      }
    }, 12000);
  };

  // Auto-generate titlu from descriere if empty
  const effectiveTitlu = data.titlu || (data.descriere ? data.descriere.slice(0, 80).trim() : "");

  const canSubmit =
    data.nume.length >= 2 &&
    data.tip &&
    effectiveTitlu.length >= 3 &&
    data.locatie.length >= 3 &&
    data.sector &&
    data.descriere.length >= 10 &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError("Completează toate câmpurile obligatorii (marcate cu *)");
      return;
    }
    setSubmitting(true);
    setError(null);

    const lat = data.lat ?? 44.4268;
    const lng = data.lng ?? 26.1025;

    try {
      const res = await fetch("/api/sesizari", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: data.nume.trim(),
          author_email: data.email.trim() || null,
          tip: data.tip,
          titlu: effectiveTitlu,
          locatie: data.locatie.trim(),
          sector: data.sector,
          lat,
          lng,
          descriere: data.descriere.trim(),
          formal_text: data.formal_text || null,
          imagini,
          publica: data.publica,
          _honey: honey,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Eroare trimitere");
      }
      // Save user data for anonymous users (so next submission auto-fills)
      if (!user && typeof window !== "undefined") {
        localStorage.setItem(
          "civic_user_data",
          JSON.stringify({ name: data.nume, address: data.adresa, email: data.email })
        );
      }
      setSubmitted({ code: json.data.code });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare trimitere");
    } finally {
      setSubmitting(false);
    }
  };

  const tipInfo = SESIZARE_TIPURI.find((t) => t.value === data.tip);
  const recipients = data.tip ? getAuthoritiesFor(data.tip, data.sector) : null;

  const gen = data.nume ? detectGen(data.nume) : null;
  const subsemnatul = gen ? subsemnatulForm(gen) : "Subsemnatul(a)";
  const domiciliat = gen ? domiciliatForm(gen) : "domiciliat(ă)";

  const previewText = data.formal_text || `Bună ziua,

${subsemnatul} ${data.nume || "[NUMELE]"}, ${domiciliat} în ${data.adresa || "[ADRESA]"}, mă adresez instituției dumneavoastră cu următoarea sesizare.

Vă aduc la cunoștință faptul că am observat ${tipInfo?.label.toLowerCase() || "[PROBLEMA]"}, situată la adresa: ${data.locatie || "[LOCAȚIA]"}. ${data.descriere || "[DESCRIEREA PROBLEMEI]"}

Vă propun, ca soluție concretă, intervenția echipelor competente pentru remedierea situației semnalate.

Vă mulțumesc anticipat pentru promptitudine. Vă rog să îmi comunicați numărul de înregistrare al prezentei sesizări, precum și termenul estimativ de soluționare, conform prevederilor OG 27/2002.

Cu respect,
${data.nume || "[NUMELE]"}`;

  const mailtoLink = () => {
    if (!recipients) return "#";
    const subject = `Sesizare ${tipInfo?.label ?? ""} - ${data.locatie}`;
    const to = recipients.primary.map((a) => a.email).join(",");
    const cc = recipients.cc.length > 0 ? `&cc=${recipients.cc.map((a) => a.email).join(",")}` : "";
    return `mailto:${to}?subject=${encodeURIComponent(subject)}${cc}&body=${encodeURIComponent(previewText)}`;
  };

  const copyText = () => {
    navigator.clipboard.writeText(previewText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (submitted) {
    const emailInput = {
      tip: data.tip,
      titlu: effectiveTitlu,
      locatie: data.locatie,
      sector: data.sector,
      descriere: data.descriere,
      formal_text: data.formal_text || null,
      author_name: data.nume,
      author_email: data.email || null,
      author_address: data.adresa || null,
      imagini,
      code: submitted.code,
    };
    return (
      <div className="max-w-2xl mx-auto py-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-2">
            Sesizare înregistrată!
          </h3>
          <p className="text-[var(--color-text-muted)] mb-2">Cod unic:</p>
          <p className="font-mono font-bold text-2xl text-[var(--color-primary)]">
            {submitted.code}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-[12px] p-5 mb-6">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-2">
            <Mail size={16} />
            Trimite acum și la autorități
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-400 mb-4">
            Alege serviciul tău de email. Se deschide într-un tab nou cu tot textul pregătit — doar apeși Send.
          </p>
          {imagini.length > 0 && (
            <p className="text-xs text-blue-700 dark:text-blue-500 mb-3 italic">
              ⚠️ Atașează fotografiile manual — link-urile lor sunt incluse în corpul emailului.
            </p>
          )}
          <EmailChoicePanel input={emailInput} />
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => router.push(`/sesizari/${submitted.code}`)}
            className="h-11 px-5 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)]"
          >
            Vezi sesizarea ta →
          </button>
          <button
            onClick={() => {
              setSubmitted(null);
              setData((d) => ({ ...INITIAL, nume: d.nume, adresa: d.adresa, email: d.email }));
              setImagini([]);
            }}
            className="h-11 px-5 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface)]"
          >
            Altă sesizare
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8">
      {/* Form */}
      <div className="space-y-5">
        {/* Honeypot — hidden from humans, bots fill it */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honey}
          onChange={(e) => setHoney(e.target.value)}
          style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
          aria-hidden="true"
        />

        <Field label="Numele tău" required>
          <input
            type="text"
            autoComplete="name"
            value={data.nume}
            onChange={(e) => update("nume", e.target.value)}
            placeholder="Ex: Maria Popescu"
            className={inputClass}
          />
        </Field>

        <Field label="Adresa ta (domiciliu)">
          <input
            type="text"
            autoComplete="street-address"
            value={data.adresa}
            onChange={(e) => update("adresa", e.target.value)}
            placeholder="Str. Exemplu 12, Sector 3"
            className={inputClass}
          />
        </Field>

        <Field label="Email (pentru notificări)">
          <input
            type="email"
            autoComplete="email"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="nume@exemplu.ro (opțional)"
            className={inputClass}
          />
        </Field>

        <Field label="Descrierea problemei" required>
          <textarea
            value={data.descriere}
            onChange={(e) => update("descriere", e.target.value.slice(0, 2000))}
            rows={4}
            placeholder="Scrie liber, natural. AI va clasifica și reformula formal."
            className={cn(inputClass, "resize-none py-3")}
          />
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {data.descriere.length}/2000 · minim 10 caractere
          </p>
        </Field>

        <button
          type="button"
          onClick={handleAIImprove}
          disabled={aiLoading || data.descriere.length < 10}
          className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-[8px] bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {aiLoading ? "AI procesează..." : "Îmbunătățește cu AI"}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Tip problemă" required>
            <select
              value={data.tip}
              onChange={(e) => update("tip", e.target.value)}
              className={inputClass}
            >
              <option value="">Alege tipul...</option>
              {SESIZARE_TIPURI.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sector" required>
            <select
              value={data.sector}
              onChange={(e) => update("sector", e.target.value)}
              className={inputClass}
            >
              <option value="">Alege...</option>
              {SECTOARE.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </Field>
        </div>

        {recipients && (
          <div className="rounded-[8px] bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3 text-xs">
            <p className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-1">
              <Mail size={12} /> Se trimite la {recipients.primary.length + recipients.cc.length} autorități:
            </p>
            <ul className="space-y-1">
              {recipients.primary.map((a) => (
                <li key={a.email} className="text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <span className="inline-block w-4 text-[10px] text-blue-500 mt-0.5">TO</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{a.name}</span>
                    <span className="block text-[10px] font-mono text-blue-700/70 dark:text-blue-500 break-all">
                      {a.email}
                    </span>
                  </div>
                </li>
              ))}
              {recipients.cc.map((a) => (
                <li key={a.email} className="text-blue-700/80 dark:text-blue-400 flex items-start gap-2">
                  <span className="inline-block w-4 text-[10px] text-blue-500 mt-0.5">CC</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{a.name}</span>
                    <span className="block text-[10px] font-mono text-blue-700/70 dark:text-blue-500 break-all">
                      {a.email}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Field label="Titlu sesizare">
          <input
            type="text"
            value={data.titlu}
            onChange={(e) => update("titlu", e.target.value.slice(0, 200))}
            placeholder="Se completează automat din descriere"
            className={inputClass}
          />
        </Field>

        <Field label="Locația problemei" required>
          <div className="flex gap-2">
            <input
              type="text"
              value={data.locatie}
              onChange={(e) => update("locatie", e.target.value)}
              placeholder="Calea Victoriei 45"
              className={cn(inputClass, "flex-1")}
            />
            <button
              type="button"
              onClick={getLocation}
              disabled={geoLoading}
              className="shrink-0 h-11 px-3 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {geoLoading ? <Loader2 size={16} className="animate-spin" /> : <Locate size={16} />}
              <span className="hidden sm:inline">{geoLoading ? "..." : "GPS"}</span>
            </button>
          </div>
          {data.lat && data.lng && (
            <p className={cn(
              "text-xs mt-1 flex items-center gap-1.5",
              gpsAccuracy != null && gpsAccuracy <= 15 ? "text-emerald-600" : "text-amber-600"
            )}>
              📍 {data.lat.toFixed(5)}, {data.lng.toFixed(5)}
              {gpsAccuracy != null && (
                <span className="font-medium">
                  · precizie ±{Math.round(gpsAccuracy)}m
                  {geoLoading && <span className="ml-1 italic opacity-70">(se rafinează...)</span>}
                  {!geoLoading && gpsAccuracy <= 15 && " ✓"}
                </span>
              )}
            </p>
          )}
        </Field>

        <Field label="Fotografii (max 5)">
          <PhotoUploader urls={imagini} onChange={setImagini} max={5} />
        </Field>

        <label className="flex items-center gap-3 p-4 bg-[var(--color-surface-2)] rounded-[12px] cursor-pointer">
          <input
            type="checkbox"
            checked={data.publica}
            onChange={(e) => update("publica", e.target.checked)}
            className="w-5 h-5 rounded accent-[var(--color-primary)]"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">Publică pe platformă</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Alți cetățeni pot vota și comenta.
            </p>
          </div>
        </label>

        {error && (
          <div className="p-3 rounded-[8px] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-[8px] bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {submitting ? "Se trimite..." : "Trimite sesizarea"}
        </button>
      </div>

      {/* Preview */}
      <div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-[family-name:var(--font-sora)] font-semibold text-lg">Previzualizare</h3>
            {data.formal_text && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-medium">
                <Sparkles size={10} /> AI
              </span>
            )}
          </div>
          <div className="bg-white dark:bg-slate-900 border border-[var(--color-border)] rounded-[8px] p-5 mb-4 text-sm leading-relaxed text-slate-800 dark:text-slate-200 max-h-[420px] overflow-y-auto shadow-inner">
            {previewText.split(/\n\n+/).map((paragraph, i) => (
              <p key={i} className="mb-3 last:mb-0 whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={mailtoLink()}
              className={cn(
                "flex items-center justify-center gap-2 h-10 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface)] transition-colors",
                !recipients && "opacity-40 pointer-events-none"
              )}
            >
              <Mail size={14} />
              Email
            </a>
            <button
              type="button"
              onClick={copyText}
              className="flex items-center justify-center gap-2 h-10 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface)] transition-colors"
            >
              <Copy size={14} />
              {copied ? "Copiat!" : "Copiază"}
            </button>
          </div>
          {recipients && (
            <p className="text-xs text-[var(--color-text-muted)] mt-4">
              <strong>Destinatari:</strong> {recipients.primary.join(", ")}
              {recipients.cc.length > 0 && <><br /><strong>CC:</strong> {recipients.cc.join(", ")}</>}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const inputClass = "w-full h-11 px-4 rounded-[8px] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-[var(--color-text)]">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
