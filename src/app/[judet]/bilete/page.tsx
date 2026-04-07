import type { Metadata } from "next";
import Link from "next/link";
import { getCountyBySlug } from "@/data/counties";
import { getCountyStats } from "@/data/statistici-judete";
import { OPERATORS } from "@/data/transport-operators";
import type { TransportOperator } from "@/data/transport-operators";
import {
  Bus,
  CreditCard,
  ExternalLink,
  Info,
  Ticket,
  CalendarDays,
  Phone,
  Smartphone,
  TrainFront,
  Zap,
  MapPin,
  Route,
} from "lucide-react";

/* ── vehicle type helpers ── */

const VEHICLE_ICON: Record<string, typeof Bus> = {
  autobuz: Bus,
  tramvai: TrainFront,
  troleibuz: Zap,
  metrou: TrainFront,
  microbuz: Bus,
};

const VEHICLE_LABEL: Record<string, string> = {
  autobuz: "Autobuz",
  tramvai: "Tramvai",
  troleibuz: "Troleibuz",
  metrou: "Metrou",
  microbuz: "Microbuz",
};

const VEHICLE_COLOR: Record<string, string> = {
  autobuz: "text-blue-600",
  tramvai: "text-red-600",
  troleibuz: "text-emerald-600",
  metrou: "text-orange-600",
  microbuz: "text-violet-600",
};

/* ── metadata ── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ judet: string }>;
}): Promise<Metadata> {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return {};
  return {
    title: `Transport public — ${county.name}`,
    description: `Informații despre transportul public în ${county.name}: bilete, abonamente, operatori, tarife actualizate.`,
    alternates: { canonical: `/${county.slug}/bilete` },
  };
}

/* ── component ── */

export default async function BiletePage({
  params,
}: {
  params: Promise<{ judet: string }>;
}) {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return null;

  const stats = getCountyStats(county.id);
  const isBucuresti = county.id === "B";

  const operatorName = stats?.transportPublicOperator ?? "Transport local";
  const operator: TransportOperator | undefined = OPERATORS[operatorName];

  // For București we also surface Metrorex alongside STB
  const metrorex = isBucuresti ? OPERATORS["Metrorex"] : undefined;

  const allOperators: TransportOperator[] = [
    ...(operator ? [operator] : []),
    ...(metrorex ? [metrorex] : []),
  ];

  return (
    <div className="container-narrow py-12 md:py-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-3">
          Transport public — {county.name}
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl">
          {isBucuresti
            ? "STB, Metrorex și toate tarifele pentru transportul public din capitală."
            : `Informații complete despre transportul public local în ${county.name}.`}
        </p>

        {isBucuresti && (
          <Link
            href="/bilete"
            className="inline-flex items-center gap-2 h-12 px-6 mt-6 rounded-[8px] bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            <CreditCard size={18} />
            Pagina completă de tarife STB + Metrorex
          </Link>
        )}
      </div>

      {/* Operator cards */}
      <div className={`grid ${allOperators.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1 max-w-2xl"} gap-6 mb-10`}>
        {allOperators.map((op) => (
          <OperatorCard key={op.name} op={op} />
        ))}

        {!operator && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Bus size={24} className="text-gray-500" />
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold">{operatorName}</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Operator de transport public</p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Nu avem deocamdată informații detaliate despre acest operator. Consultă operatorul local pentru tarife și trasee.
            </p>
          </div>
        )}
      </div>

      {/* Vehicle types */}
      {operator && (
        <>
          <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-6">
            Tipuri de vehicule
          </h2>
          <div className="flex flex-wrap gap-3 mb-10">
            {(isBucuresti
              ? [...(operator?.types ?? []), ...(metrorex?.types ?? [])]
              : operator.types
            ).map((type) => {
              const Icon = VEHICLE_ICON[type] ?? Bus;
              return (
                <div
                  key={type}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px]"
                >
                  <Icon size={20} className={VEHICLE_COLOR[type] ?? "text-gray-600"} />
                  <span className="font-medium text-sm">{VEHICLE_LABEL[type] ?? type}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Tariff cards */}
      <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-6">
        Tarife
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Single ticket */}
        <TariffCard
          icon={<Ticket size={20} className="text-green-600" />}
          iconBg="bg-green-100 dark:bg-green-900/30"
          title="Bilet o călătorie"
          price={operator?.ticketPrice ?? "3-5 lei"}
          description="O singură călătorie, valabil ~60 min"
        />

        {/* Monthly pass */}
        <TariffCard
          icon={<CalendarDays size={20} className="text-purple-600" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          title="Abonament lunar"
          price={operator?.monthlyPass ?? "50-100 lei"}
          description="Toate liniile, nelimitat / 30 zile"
        />

        {/* Metrorex separate ticket for București */}
        {metrorex && (
          <TariffCard
            icon={<TrainFront size={20} className="text-orange-600" />}
            iconBg="bg-orange-100 dark:bg-orange-900/30"
            title="Bilet metrou"
            price={metrorex.ticketPrice}
            description={`Abonament lunar: ${metrorex.monthlyPass}`}
          />
        )}

        {/* App / card */}
        <TariffCard
          icon={<CreditCard size={20} className="text-blue-600" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          title="Card / Aplicație"
          price={operator?.app ?? "Variabil"}
          description={
            operator?.app
              ? "Plată prin aplicație mobilă sau card contactless"
              : "Unii operatori acceptă plata contactless sau prin aplicație"
          }
        />
      </div>

      {/* Info cards grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* County info */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Info size={24} className="text-amber-600" />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold">Informații {county.name}</h2>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-primary)] mt-0.5">&#8226;</span>
              Populație: {stats?.populatie.toLocaleString("ro-RO")} locuitori
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-primary)] mt-0.5">&#8226;</span>
              Suprafață: {stats?.suprafataKmp.toLocaleString("ro-RO")} km&#178;
            </li>
            {operator?.lines && (
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-primary)] mt-0.5">&#8226;</span>
                ~{operator.lines} linii de transport public
              </li>
            )}
            {operator?.coverage && (
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-primary)] mt-0.5">&#8226;</span>
                Acoperire: {operator.coverage}
              </li>
            )}
          </ul>
        </div>

        {/* Contact / links */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Phone size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold">Contact & Linkuri</h2>
            </div>
          </div>
          <ul className="space-y-3 text-sm">
            {allOperators.map((op) => (
              <li key={op.website}>
                <a
                  href={op.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[var(--color-primary)] font-medium hover:underline"
                >
                  <ExternalLink size={14} />
                  {op.name} &mdash; {op.website.replace("https://", "")}
                </a>
              </li>
            ))}
            {allOperators.filter((o) => o.contactPhone).map((op) => (
              <li key={op.contactPhone} className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Phone size={14} />
                {op.name}: <a href={`tel:${op.contactPhone}`} className="font-medium text-[var(--color-primary)] hover:underline">{op.contactPhone}</a>
              </li>
            ))}
            {allOperators.filter((o) => o.app).map((op) => (
              <li key={`${op.name}-app`} className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Smartphone size={14} />
                Aplicație: <span className="font-medium">{op.app}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-400 rounded-[12px] p-4 text-sm mb-6">
        <p className="text-blue-900 dark:text-blue-200">
          <strong>Notă:</strong> Prețurile sunt orientative (2024-2025) și pot varia. Consultă operatorul local pentru tarife actualizate.
          {operator?.website && (
            <>
              {" "}Vizitează{" "}
              <a
                href={operator.website}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                {operator.website.replace("https://", "")}
              </a>
              {" "}pentru informații oficiale.
            </>
          )}
        </p>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-wrap gap-4">
        {allOperators.map((op) => (
          <a
            key={op.website}
            href={op.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-[8px] bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            <ExternalLink size={18} />
            {op.name}
          </a>
        ))}
      </div>
    </div>
  );
}

/* ── sub-components ── */

function OperatorCard({ op }: { op: TransportOperator }) {
  const mainType = op.types[0] ?? "autobuz";
  const MainIcon = VEHICLE_ICON[mainType] ?? Bus;
  const iconColor = mainType === "metrou" ? "text-orange-600" : "text-blue-600";
  const iconBg =
    mainType === "metrou"
      ? "bg-orange-100 dark:bg-orange-900/30"
      : "bg-blue-100 dark:bg-blue-900/30";

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center`}>
          <MainIcon size={24} className={iconColor} />
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold">{op.name}</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            {op.types.map((t) => VEHICLE_LABEL[t] ?? t).join(" / ")}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
        {op.lines && (
          <div className="flex items-center gap-2">
            <Route size={14} className="shrink-0" />
            ~{op.lines} linii
          </div>
        )}
        <div className="flex items-center gap-2">
          <MapPin size={14} className="shrink-0" />
          {op.coverage}
        </div>
        <div className="flex items-center gap-2">
          <Ticket size={14} className="shrink-0" />
          Bilet: <span className="font-semibold text-[var(--color-text)]">{op.ticketPrice}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="shrink-0" />
          Abonament: <span className="font-semibold text-[var(--color-text)]">{op.monthlyPass}</span>
        </div>
        {op.app && (
          <div className="flex items-center gap-2">
            <Smartphone size={14} className="shrink-0" />
            App: {op.app}
          </div>
        )}
        {op.contactPhone && (
          <div className="flex items-center gap-2">
            <Phone size={14} className="shrink-0" />
            <a href={`tel:${op.contactPhone}`} className="text-[var(--color-primary)] hover:underline">{op.contactPhone}</a>
          </div>
        )}
      </div>

      <a
        href={op.website}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 mt-4 text-sm text-[var(--color-primary)] font-medium hover:underline"
      >
        <ExternalLink size={14} />
        {op.website.replace("https://", "")}
      </a>
    </div>
  );
}

function TariffCard({
  icon,
  iconBg,
  title,
  price,
  description,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  price: string;
  description: string;
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="font-[family-name:var(--font-sora)] font-semibold text-lg">{title}</h3>
      </div>
      <p className="text-3xl font-bold mb-1">{price}</p>
      <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
    </div>
  );
}
