import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ArrowRight, MapPin, ExternalLink } from "lucide-react";
import {
  CALENDAR_EVENTS,
  CATEGORY_META,
  getUpcomingEvents,
  type CalendarEvent,
} from "@/data/calendar-civic";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EventListJsonLd } from "@/components/FaqJsonLd";

export const metadata: Metadata = {
  title: "Calendar civic — date importante pentru cetățeni",
  description:
    "Alegeri, deadline-uri taxe, ședințe CGMB, consultări publice, comemorări. Toate datele importante pentru cetățenii României.",
  alternates: { canonical: "/calendar-civic" },
};

export const revalidate = 86400; // 24h

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ro-RO", { timeZone: "Europe/Bucharest",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function relativeDays(iso: string): string {
  const days = Math.round((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "trecut";
  if (days === 0) return "azi";
  if (days === 1) return "mâine";
  if (days < 7) return `în ${days} zile`;
  if (days < 30) return `în ${Math.round(days / 7)} săpt.`;
  if (days < 365) return `în ${Math.round(days / 30)} luni`;
  return `în ${Math.round(days / 365)} ani`;
}

function EventCard({ event }: { event: CalendarEvent }) {
  const meta = CATEGORY_META[event.category];
  return (
    <Card hover accentColor={meta.color} className="h-full">
      <div className="flex items-start justify-between gap-3 mb-2">
        <Badge style={{ backgroundColor: `${meta.color}22`, color: meta.color }}>
          <span aria-hidden="true">{meta.icon}</span> {meta.label}
        </Badge>
        <span className="text-xs text-[var(--color-text-muted)] shrink-0 tabular-nums">
          {relativeDays(event.date)}
        </span>
      </div>
      <h3 className="font-bold mb-1">{event.title}</h3>
      <div className="text-xs text-[var(--color-text-muted)] mb-2 flex items-center gap-1">
        <CalendarDays size={12} aria-hidden="true" />
        <time dateTime={event.date}>{formatDate(event.date)}</time>
        {event.endDate && (
          <> <span aria-hidden="true">–</span> <time dateTime={event.endDate}>{formatDate(event.endDate)}</time></>
        )}
      </div>
      <p className="text-sm text-[var(--color-text-muted)] mb-3">{event.description}</p>
      {event.location && (
        <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mb-2">
          <MapPin size={12} aria-hidden="true" /> {event.location}
        </div>
      )}
      {event.url && (
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline mt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
          aria-label={`Detalii despre „${event.title}" (deschide în tab nou)`}
        >
          Detalii <ExternalLink size={12} aria-hidden="true" />
        </a>
      )}
    </Card>
  );
}

export default function CalendarCivicPage() {
  const upcoming = getUpcomingEvents(8);

  // Group by category
  const byCategory = new Map<string, CalendarEvent[]>();
  for (const e of CALENDAR_EVENTS) {
    const end = e.endDate ? new Date(e.endDate) : new Date(e.date);
    if (end < new Date()) continue; // skip past events
    const list = byCategory.get(e.category) ?? [];
    list.push(e);
    byCategory.set(e.category, list);
  }
  for (const list of byCategory.values()) {
    list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  return (
    <div className="container-narrow py-12 md:py-16">
      <EventListJsonLd
        events={upcoming.slice(0, 15).map((e) => ({
          name: e.title,
          description: e.description,
          startDate: e.date,
          endDate: e.endDate,
          url: `https://civia.ro/calendar-civic#${e.id}`,
          location: e.location,
        }))}
      />
      <Badge className="mb-4">Calendar civic</Badge>
      <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
        <CalendarDays size={40} className="text-[var(--color-primary)]" aria-hidden="true" />
        Date care contează pentru tine
      </h1>
      <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mb-10 leading-relaxed">
        Deadline-uri de plată, alegeri viitoare, ședințe publice ale consiliilor, consultări.
        Toate într-un singur loc, cu surse oficiale. Actualizat manual.
      </p>

      {/* Upcoming section — top 8 */}
      <section className="mb-12">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-5">
          Urmează
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {upcoming.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>

      {/* Grouped by category */}
      {Object.entries(CATEGORY_META).map(([key, meta]) => {
        const events = byCategory.get(key);
        if (!events || events.length === 0) return null;
        return (
          <section key={key} className="mb-12">
            <h2 className="font-[family-name:var(--font-sora)] text-xl md:text-2xl font-bold mb-5 flex items-center gap-2">
              <span className="text-2xl">{meta.icon}</span>
              {meta.label}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <section className="mt-16 p-6 rounded-[var(--radius-card)] bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/20 text-center">
        <p className="text-sm text-[var(--color-text-muted)] mb-3">
          Vezi și ghidul de drepturi al cetățeanului — informări legale,
          sesizări, petiții, acces la informații publice.
        </p>
        <Link
          href="/ghiduri/ghid-cetatean"
          className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline font-medium"
        >
          Ghid cetățean — drepturile tale <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
