"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";

interface Props {
  code: string;
  initialFollowing: boolean;
  initialCount: number;
}

export function FollowButton({ code, initialFollowing, initialCount }: Props) {
  const { user, openAuthModal } = useAuth();
  const { toast } = useToast();
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setLoading(true);
    const prev = following;
    const nextState = !following;
    // optimistic
    setFollowing(nextState);
    setCount((c) => c + (nextState ? 1 : -1));

    try {
      const res = await fetch(`/api/sesizari/${code}/follow`, {
        method: nextState ? "POST" : "DELETE",
      });
      if (!res.ok) throw new Error();
      toast(
        nextState ? "Urmărești sesizarea — îți trimitem update-uri" : "Ai oprit urmărirea",
        nextState ? "success" : "info",
        3000
      );
    } catch {
      // rollback
      setFollowing(prev);
      setCount((c) => c + (prev ? 1 : -1));
      toast("Nu s-a putut salva", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-2 h-10 px-4 rounded-[8px] text-sm font-medium transition-all disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]",
        following
          ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
          : "bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-border)]"
      )}
      aria-pressed={following}
      title={following ? "Oprește urmărirea" : "Primește email la schimbări de status"}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : following ? (
        <BookmarkCheck size={14} />
      ) : (
        <Bookmark size={14} />
      )}
      <span>{following ? "Urmărești" : "Urmărește"}</span>
      {count > 0 && (
        <span className={cn("text-xs", following ? "text-white/80" : "text-[var(--color-text-muted)]")}>
          · {count}
        </span>
      )}
    </button>
  );
}
