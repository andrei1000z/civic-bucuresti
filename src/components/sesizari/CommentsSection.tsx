"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { timeAgo } from "@/lib/utils";
import type { SesizareCommentRow } from "@/lib/supabase/types";

interface CommentsSectionProps {
  code: string;
  initialComments: SesizareCommentRow[];
}

export function CommentsSection({ code, initialComments }: CommentsSectionProps) {
  const { user, openAuthModal } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!body.trim() || posting) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/sesizari/${code}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Eroare");
      setComments((prev) => [...prev, json.data]);
      setBody("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare");
    } finally {
      setPosting(false);
    }
  };

  return (
    <section>
      <h3 className="font-[family-name:var(--font-sora)] font-semibold text-lg mb-4 flex items-center gap-2">
        <MessageSquare size={18} />
        Comentarii ({comments.length})
      </h3>

      {/* Compose */}
      <form
        onSubmit={handlePost}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4 mb-4"
      >
        {user ? (
          <>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, 2000))}
              rows={3}
              placeholder="Scrie un comentariu..."
              className="w-full p-3 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              disabled={posting}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-[var(--color-text-muted)]">
                {body.length}/2000
              </span>
              <button
                type="submit"
                disabled={!body.trim() || posting}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-busy={posting}
              >
                {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {posting ? "Se trimite..." : "Trimite"}
              </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          </>
        ) : (
          <button
            type="button"
            onClick={openAuthModal}
            className="w-full py-3 text-sm text-center text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] rounded-[8px] transition-colors"
          >
            Autentifică-te ca să comentezi →
          </button>
        )}
      </form>

      {/* List */}
      {comments.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] text-center py-8">
          Niciun comentariu încă. Fii primul!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <article
              key={c.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4"
            >
              <header className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">{c.author_name}</p>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {timeAgo(c.created_at)}
                </span>
              </header>
              <p className="text-sm whitespace-pre-wrap">{c.body}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
