import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, Calendar, User, Clock, CheckCircle2, UserPlus, Send, XCircle, FileCheck, MapPinned, Route as RouteIcon } from "lucide-react";
import {
  getSesizareByCode,
  getTimeline,
  getComments,
  getUserVote,
  getUserVerification,
  getSimilarSesizari,
  isFollowing,
} from "@/lib/sesizari/repository";
import { createSupabaseServer } from "@/lib/supabase/server";
import { STATUS_COLORS, STATUS_LABELS, SESIZARE_TIPURI } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { VoteButtons } from "@/components/sesizari/VoteButtons";
import { CommentsSection } from "@/components/sesizari/CommentsSection";
import { EvenimentMap } from "@/components/maps/EvenimentMap";
import { SignSesizareButton } from "@/components/sesizari/SignSesizareButton";
import { MarkResolvedButton } from "@/components/sesizari/MarkResolvedButton";
import { ShareMenu } from "@/components/sesizari/ShareMenu";
import { BeforeAfter } from "@/components/sesizari/BeforeAfter";
import { VerifyPanel } from "@/components/sesizari/VerifyPanel";
import { SimilarSesizari } from "@/components/sesizari/SimilarSesizari";
import { FollowButton } from "@/components/sesizari/FollowButton";
import { DeleteSesizareButton } from "@/components/sesizari/DeleteSesizareButton";
import { PhotoGallery } from "@/components/sesizari/PhotoGallery";
import { BreadcrumbJsonLd } from "@/components/FaqJsonLd";
import { stripPrivateAddress } from "@/lib/privacy";
import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

const EVENT_LABELS: Record<string, string> = {
  depusa: "Sesizare depusă",
  inregistrata: "Înregistrată la registratură",
  rutata: "Trimisă la direcția de resort",
  in_teren: "Inspector pe teren",
  rezolvat: "Problemă rezolvată",
  respins: "Sesizare respinsă",
  cosemnat: "Un alt cetățean a trimis și el această sesizare",
};

const EVENT_ACCENT: Record<string, string> = {
  depusa: "#2563EB",
  inregistrata: "#6366F1",
  rutata: "#8B5CF6",
  in_teren: "#F59E0B",
  rezolvat: "#059669",
  respins: "#DC2626",
  cosemnat: "#0891B2",
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

  const [timeline, comments, similar] = await Promise.all([
    getTimeline(sesizare.id),
    getComments(sesizare.id),
    getSimilarSesizari(sesizare.id, 300),
  ]);

  // Check if current user has voted / verified
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  let userVote: -1 | 1 | null = null;
  let userVerification: boolean | null = null;
  let userFollowing = false;
  if (user) {
    userVote = await getUserVote({ sesizareId: sesizare.id, userId: user.id });
    userVerification = await getUserVerification({
      sesizareId: sesizare.id,
      userId: user.id,
    });
    userFollowing = await isFollowing({ sesizareId: sesizare.id, userId: user.id });
  }

  const isAuthor = user
    ? sesizare.user_id === user.id || sesizare.author_email === user.email
    : false;

  // Poză "before" pentru before/after: prima imagine a sesizării (dacă există)
  const beforeUrl = sesizare.imagini.length > 0 ? sesizare.imagini[0] : null;
  const afterUrl = sesizare.resolved_photo_url;
  const isResolved = sesizare.status === "rezolvat";
  const hasBeforeAfter = isResolved && beforeUrl && afterUrl;

  const tipLabel = SESIZARE_TIPURI.find((t) => t.value === sesizare.tip)?.label ?? sesizare.tip;
  const tipIcon = SESIZARE_TIPURI.find((t) => t.value === sesizare.tip)?.icon ?? "📝";

  return (
    <div className="container-narrow py-8 md:py-12">
      <BreadcrumbJsonLd items={[
        { name: "Civia", url: SITE_URL },
        { name: "Sesizări", url: `${SITE_URL}/sesizari` },
        { name: sesizare.titlu, url: `${SITE_URL}/sesizari/${sesizare.code}` },
      ]} />
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
          <FollowButton
            code={sesizare.code}
            initialFollowing={userFollowing}
            initialCount={sesizare.nr_followers ?? 0}
          />
          <ShareMenu
            url={`${SITE_URL}/sesizari/${sesizare.code}`}
            title={sesizare.titlu}
            size="md"
          />
          <DeleteSesizareButton
            code={sesizare.code}
            authorEmail={sesizare.author_email}
            userId={sesizare.user_id}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        <div>
          {/* Before / After (doar dacă e rezolvat) */}
          {hasBeforeAfter && (
            <BeforeAfter
              beforeUrl={beforeUrl}
              afterUrl={afterUrl}
              resolvedAt={sesizare.resolved_at}
            />
          )}

          {/* Description */}
          <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 mb-6">
            <h2 className="font-semibold mb-3">Descriere</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{sesizare.descriere}</p>
          </section>

          {/* Formal text — address stripped for privacy */}
          {sesizare.formal_text && (
            <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 mb-6">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-medium">
                  ✨ AI
                </span>
                Text formal
              </h2>
              <div className="bg-[var(--color-surface-2)] rounded-[8px] p-4 text-xs font-mono whitespace-pre-wrap">
                {stripPrivateAddress(sesizare.formal_text)}
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-2 italic">
                Adresa de domiciliu a fost ascunsă automat pentru protecția datelor personale.
              </p>
            </section>
          )}

          {/* Photos */}
          {sesizare.imagini.length > 0 && (
            <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 mb-6">
              <h2 className="font-semibold mb-3">Fotografii</h2>
              <PhotoGallery urls={sesizare.imagini} title="Fotografie" />
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
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
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

          {/* Verify panel (doar la rezolvate) */}
          {isResolved && (
            <VerifyPanel
              code={sesizare.code}
              verifDa={sesizare.verif_da}
              verifNu={sesizare.verif_nu}
              initialUserChoice={userVerification}
              isAuthor={isAuthor}
            />
          )}

          {/* Similar sesizari (cine a mai sesizat) */}
          <SimilarSesizari sesizari={similar} />

          {/* Timeline */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                Status & activitate
              </p>
              {(() => {
                const cosemneNr = timeline.filter((e) => e.event_type === "cosemnat").length;
                return cosemneNr > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-700 dark:text-cyan-400">
                    <UserPlus size={10} />
                    +{cosemneNr} cetățeni
                  </span>
                ) : null;
              })()}
            </div>
            {timeline.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">Nu există evenimente încă.</p>
            ) : (
              <ol className="relative border-l-2 border-[var(--color-border)] ml-3 space-y-4">
                {timeline.map((step, i) => {
                  const isLast = i === timeline.length - 1;
                  const accent = EVENT_ACCENT[step.event_type] ?? "#64748B";
                  const Icon =
                    step.event_type === "cosemnat"
                      ? UserPlus
                      : step.event_type === "rezolvat"
                      ? CheckCircle2
                      : step.event_type === "respins"
                      ? XCircle
                      : step.event_type === "inregistrata"
                      ? FileCheck
                      : step.event_type === "rutata"
                      ? RouteIcon
                      : step.event_type === "in_teren"
                      ? MapPinned
                      : Send;
                  return (
                    <li key={step.id} className="ml-6">
                      <span
                        className="absolute -left-[13px] w-6 h-6 rounded-full flex items-center justify-center text-white ring-2 ring-[var(--color-surface)]"
                        style={{ backgroundColor: accent }}
                      >
                        <Icon size={12} />
                      </span>
                      <p className={`text-sm ${isLast ? "font-semibold" : "font-medium"}`}>
                        {EVENT_LABELS[step.event_type] ?? step.event_type}
                      </p>
                      {step.description && step.event_type !== "cosemnat" && (
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          {step.description}
                        </p>
                      )}
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
