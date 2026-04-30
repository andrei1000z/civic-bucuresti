import Link from "next/link";
import { Mail, MessageSquareText, Users } from "lucide-react";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface SubscriberRow {
  id: string;
  display_name: string | null;
  full_name: string | null;
  phone: string | null;
  newsletter_email_optin: boolean;
  newsletter_sms_optin: boolean;
  email: string | null;
  emailConfirmedAt: string | null;
}

async function loadSubscribers(): Promise<SubscriberRow[]> {
  const admin = createSupabaseAdmin();

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, display_name, full_name, phone, newsletter_email_optin, newsletter_sms_optin, updated_at")
    .or("newsletter_email_optin.eq.true,newsletter_sms_optin.eq.true")
    .order("updated_at", { ascending: false });

  if (!profiles || profiles.length === 0) return [];

  // Bulk-fetch auth users so we can attach the email + confirmation
  // status. The first 1000 users covers any reasonable subscriber count.
  const { data: usersPage } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const userById = new Map(
    (usersPage?.users ?? []).map((u) => [u.id, u]),
  );

  return profiles.map((p) => {
    const u = userById.get(p.id);
    return {
      id: p.id,
      display_name: p.display_name,
      full_name: p.full_name,
      phone: p.phone,
      newsletter_email_optin: !!p.newsletter_email_optin,
      newsletter_sms_optin: !!p.newsletter_sms_optin,
      email: u?.email ?? null,
      emailConfirmedAt: u?.email_confirmed_at ?? null,
    };
  });
}

export default async function NewsletterPage() {
  const subscribers = await loadSubscribers();
  const emailCount = subscribers.filter((s) => s.newsletter_email_optin).length;
  const smsCount = subscribers.filter((s) => s.newsletter_sms_optin).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Mail}
          label="Abonați email"
          value={emailCount}
          color="#2563EB"
        />
        <StatCard
          icon={MessageSquareText}
          label="Abonați SMS"
          value={smsCount}
          color="#059669"
        />
        <StatCard
          icon={Users}
          label="Total contacte"
          value={subscribers.length}
          color="#8B5CF6"
        />
      </div>

      {/* Subscriber table */}
      {subscribers.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-[var(--radius-md)] p-10 text-center">
          <Mail size={32} className="mx-auto text-[var(--color-text-muted)] mb-3" aria-hidden="true" />
          <p className="text-sm text-[var(--color-text-muted)] mb-1 font-medium">
            Niciun abonat încă
          </p>
          <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto">
            Utilizatorii bifează newsletter pe email / SMS din pagina lor de cont.
            Abonații apar aici imediat ce schimbă preferința.
          </p>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-1)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
              <tr>
                <th className="text-left p-3 text-[11px] uppercase tracking-wider font-semibold">Utilizator</th>
                <th className="text-left p-3 text-[11px] uppercase tracking-wider font-semibold">Email</th>
                <th className="text-left p-3 text-[11px] uppercase tracking-wider font-semibold">Telefon</th>
                <th className="text-center p-3 text-[11px] uppercase tracking-wider font-semibold">Email opt-in</th>
                <th className="text-center p-3 text-[11px] uppercase tracking-wider font-semibold">SMS opt-in</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/50 transition-colors"
                >
                  <td className="p-3">
                    <p className="font-medium">{s.display_name ?? s.full_name ?? "Cetățean"}</p>
                    {s.full_name && s.display_name !== s.full_name && (
                      <p className="text-[11px] text-[var(--color-text-muted)]">{s.full_name}</p>
                    )}
                  </td>
                  <td className="p-3 font-mono text-xs">
                    {s.email ? (
                      <a
                        href={`mailto:${s.email}`}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        {s.email}
                      </a>
                    ) : (
                      <span className="text-[var(--color-text-muted)] italic">(necunoscut)</span>
                    )}
                    {s.emailConfirmedAt && (
                      <span
                        className="ml-2 text-[10px] text-emerald-600 dark:text-emerald-400"
                        title={`Confirmat ${formatDateTime(s.emailConfirmedAt)}`}
                      >
                        ✓
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-xs">
                    {s.phone ? (
                      <a href={`tel:${s.phone}`} className="text-[var(--color-primary)] hover:underline">
                        {s.phone}
                      </a>
                    ) : (
                      <span className="text-[var(--color-text-muted)] italic">—</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {s.newsletter_email_optin ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs">✓</span>
                    ) : (
                      <span className="text-[var(--color-text-muted)]">—</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {s.newsletter_sms_optin ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs">✓</span>
                    ) : (
                      <span className="text-[var(--color-text-muted)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
        Abonații își gestionează singuri preferințele din pagina{" "}
        <Link href="/cont" className="text-[var(--color-primary)] underline">
          /cont
        </Link>
        . Bifa se salvează automat la fiecare schimbare; nu e nevoie de buton de „salvează".
        Pentru export, contactează operatorul prin /legal/confidentialitate.
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Mail;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-1)] p-5">
      <div
        className="w-10 h-10 rounded-[var(--radius-xs)] grid place-items-center mb-3"
        style={{ backgroundColor: `${color}1a`, color }}
        aria-hidden="true"
      >
        <Icon size={18} />
      </div>
      <p
        className="text-3xl font-extrabold tabular-nums leading-none"
        style={{ color }}
      >
        {value.toLocaleString("ro-RO")}
      </p>
      <p className="text-xs text-[var(--color-text-muted)] mt-2 font-medium uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}
