"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, MessageCircle, Send, Link2, QrCode, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";

interface Props {
  url: string;
  title: string;
  size?: "sm" | "md";
}

export function ShareMenu({ url, title, size = "sm" }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, []);

  const fullText = `${title} - Civia`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${fullText}\n${url}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(fullText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}&url=${encodeURIComponent(url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${fullText}\n${url}`);
      setCopied(true);
      toast("Link copiat!", "success", 2000);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiază:", url);
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;

  const iconSize = size === "sm" ? 13 : 15;
  const px = size === "sm" ? "px-2 py-1" : "px-3 py-1.5";

  // Prefer the native Web Share API when available (mobile browsers,
  // Chrome desktop 89+). Falls through to the menu if the user cancels
  // or the platform lacks support.
  const tryNativeShare = async (): Promise<boolean> => {
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (typeof nav.share !== "function") return false;
    try {
      await nav.share({ title, url });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <>
      <div ref={ref} className="relative inline-block" data-no-print>
        <button
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            // On touch / small screens try the OS share sheet first.
            if (typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches) {
              const shared = await tryNativeShare();
              if (shared) return;
            }
            setOpen(!open);
          }}
          className={cn(
            "inline-flex items-center gap-1 rounded-[8px] text-xs font-medium transition-colors",
            px,
            "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
          )}
          aria-label="Distribuie"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <Share2 size={iconSize} />
          <span>Share</span>
        </button>

        {open && (
          <div
            role="menu"
            className="absolute bottom-full right-0 mb-2 w-56 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] shadow-[var(--shadow-xl)] overflow-hidden z-50">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--color-surface-2)] transition-colors"
            >
              <MessageCircle size={16} className="text-[#25D366]" />
              <span>WhatsApp</span>
            </a>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--color-surface-2)] transition-colors"
            >
              <Send size={16} className="text-[#0088cc]" />
              <span>Telegram</span>
            </a>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--color-surface-2)] transition-colors"
            >
              <span className="w-4 h-4 flex items-center justify-center text-sm font-bold">𝕏</span>
              <span>Twitter/X</span>
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--color-surface-2)] transition-colors"
            >
              <span className="w-4 h-4 flex items-center justify-center text-sm font-bold text-[#1877F2]">f</span>
              <span>Facebook</span>
            </a>
            <div className="border-t border-[var(--color-border)]" />
            <button
              onClick={() => { copyLink(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--color-surface-2)] transition-colors text-left"
            >
              {copied ? <Check size={16} className="text-emerald-600" /> : <Link2 size={16} />}
              <span>{copied ? "Copiat!" : "Copiază link + titlu"}</span>
            </button>
            <button
              onClick={() => { setQrOpen(true); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--color-surface-2)] transition-colors text-left"
            >
              <QrCode size={16} />
              <span>QR code</span>
            </button>
          </div>
        )}
      </div>

      {qrOpen && (
        <div
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setQrOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[12px] p-6 max-w-sm shadow-2xl"
          >
            <h3 className="font-semibold text-lg mb-3 text-slate-900 text-center">Scanează codul</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="QR code" className="mx-auto" width={300} height={300} />
            <p className="text-xs text-center text-slate-600 mt-3 truncate">{url}</p>
            <button
              onClick={() => setQrOpen(false)}
              className="mt-4 w-full h-10 rounded-[8px] bg-slate-900 text-white text-sm font-medium"
            >
              Închide
            </button>
          </div>
        </div>
      )}
    </>
  );
}
