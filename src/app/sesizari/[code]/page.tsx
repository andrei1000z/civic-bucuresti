import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, Calendar, User, Clock, CheckCircle2, Image as ImgIcon } from "lucide-react";
import { getSesizareByCode, getTimeline, getComments, getUserVote } from "@/lib/sesizari/repository";
import { createSupabaseServer } from "@/lib/supabase/server";
import { STATUS_COLORS, STATUS_LABELS, SESIZARE_TIPURI } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { VoteButtons } from "@/components/sesizari/VoteButtons";
import { CommentsSection } from "@/components/sesizari/CommentsSection";
import { EvenimentMap } from "@/components/maps/EvenimentMap";
import { SignSesizareButton } from "@/components/sesizari/SignSesizareButton";
import { MarkResolvedButton } from "@/components/sesizari/MarkResolvedButton";

export const dynamic = "force-dynamic";

const EVENT_LABELS: Record<string, string> = {
  depusa: "Sesizare depusă",
  inregistrata: "Înregistrată la registratură",
  rutata: "Trimisă la direcția de resort",
  in_teren: "Inspector pe teren",
  rezolvat: "Problemă rezolvată",
  respins: "Sesizare respinsă",
};

export async function generateMetadata(
  { params }: { params: Promise<{ code: string }> }
): Promise<Metadata> {
  const { code } = await params;
  const s = await getSesizareByCode(code);
  return {
    title: s ? s.titlu : "Sesizare negăsită",
    description: s?.descriere.slice(0, 160) ?? "",
    alternates: { canonical: `/sesizari/${code}` },
    openGraph: {
      title: s?.titlu,
      description: s?.descriere.slice(0, 160),
      type: "article",
    },
  };
}

export default async function SesizareDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const sesizare = await getSesizareByCode(code);
  if (!sesizare) notFound();

  const [timeline, comments] = await Promise.all([
    getTimeline(sesizare.id),
    getComments(sesizare.id),
  ]);

  // Check if current user has voted
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  let userVote: -1 | 1 | null = null;
  if (user) {
    userVote = await getUserVote({ sesizareId: sesizare.id, userId: user.id });
  }

  const tipLabel = SESIZARE_TIPURI.find((t) => t.value === sesizare.tip)?.label ?? sesizare.tip;
  const tipIcon = SESIZARE_TIPURI.find((t) => t.value === sesizare.tip)?.icon ?? "📝";

  return (
    <div className="container-narrow py-8 md:py-12">
      <Link
        href="/sesizari"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
      >
        <ChevronLeft size={16} /> Toate sesizările
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge bgColor={STATUS_COLORS[sesizare.status] ?? "#64748B"} color="white">
            {STATUS_LABELS[sesizare.status] ?? sesizare.status}
          </Badge>
          <Badge variant="neutral">
            <span className="mr-1">{tipIcon}</span>
            {tipLabel}
          </Badge>
          <Badge variant="neutral">{sesizare.sector}</Badge>
          <span className="font-mono text-xs text-[var(--color-text-muted)] ml-auto">
            {sesizare.code}
          </span>
        </div>
        <h1 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold mb-3">
          {sesizare.titlu}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)] mb-4">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} />
            {sesizare.locatie}
          </span>
          <span className="flex items-center gap-1.5">
            <User size={14} />
            {sesizare.author_name}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {formatDate(sesizare.created_at)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <SignSesizareButton
            tip={sesizare.tip}
            titlu={sesizare.titlu}
            locatie={sesizare.locatie}
            sector={sesizare.sector}
            descriere={sesizare.descriere}
            formal_text={sesizare.formal_text}
            imagini={sesizare.imagini}
            code={sesizare.code}
            variant="primary"
          />
          <MarkResolvedButton
            code={sesizare.code}
            status={sesizare.status}
            authorEmail={sesizare.author_email}
            userId={sesizare.user_id}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        <div>
          {/* Description */}
          <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 mb-6">
            <h2 className="font-semibold mb-3">Descriere</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{sesizare.descriere}</p>
          </section>

          {/* Formal text */}
          {sesizare.formal_text && (
            <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 mb-6">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-medium">
                  ✨ AI
                </span>
                Text formal
              </h2>
              <div className="bg-[var(--color-surface-2)] rounded-[8px] p-4 text-xs font-mono whitespace-pre-wrap">
                {sesizare.formal_text}
              </div>
            </section>
          )}

          {/* Photos */}
          {sesizare.imagini.length > 0 && (
            <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 mb-6">
              <h2 className="font-semibold mb-3">Fotografii</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {sesizare.imagini.map((url, i) => (
                  <div key={i} className="aspect-video rounded-[8px] bg-[var(--color-surface-2)] overflow-hidden">
                    {url.startsWith("http") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImgIcon size={24} className="text-[var(--color-text-muted)]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Map */}
          <section className="mb-6">
            <h2 className="font-semibold mb-3">Localizare</h2>
            <EvenimentMap
              coords={[sesizare.lat, sesizare.lng]}
              label={sesizare.titlu}
              color={STATUS_COLORS[sesizare.status] ?? "#64748B"}
              zoom={16}
              height="320px"
            />
          </section>

          {/* Comments */}
          <CommentsSection code={sesizare.code} initialComments={comments} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Vote */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5 sticky top-20">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-3">
              Sprijină sesizarea
            </p>
            <VoteButtons
              code={sesizare.code}
              initialUpvotes={sesizare.upvotes}
              initialDownvotes={sesizare.downvotes}
              initialUserVote={userVote}
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-3">
              {sesizare.voturi_net > 0 ? "+" : ""}
              {sesizare.voturi_net} scor net · {sesizare.nr_comentarii} comentarii
            </p>
          </div>

          {/* Timeline */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-4">
              Status
            </p>
            {timeline.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">Nu există evenimente.</p>
            ) : (
              <ol className="relative border-l-2 border-[var(--color-border)] ml-3 space-y-4">
                {timeline.map((step, i) => {
                  const isLast = i === timeline.length - 1;
                  return (
                    <li key={step.id} className="ml-6">
                      <span className="absolute -left-[13px] w-6 h-6 rounded-full flex items-center justify-center bg-[var(--color-secondary)] text-white">
                        <CheckCircle2 size={13} />
                      </span>
                      <p className={`text-sm ${isLast ? "font-semibold" : "font-medium"}`}>
                        {EVENT_LABELS[step.event_type] ?? step.event_type}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {formatDateTime(step.created_at)}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
