import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";
import { isValidImage, isValidPdf } from "@/lib/sanitize";
import { MAX_UPLOAD_BYTES as MAX_FILE_SIZE } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_DOC_TYPES = [...ALLOWED_IMAGE_TYPES, "application/pdf"];
// PDFs are allowed up to a higher cap because scanned official letters
// often run 2–10 MB, but only when the caller opts in via `kind=document`.
const PDF_MAX_BYTES = 15 * 1024 * 1024;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = await rateLimitAsync(`upload:${ip}`, { limit: 15, windowMs: 5 * 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Prea multe uploads. Așteaptă câteva minute." },
      { status: 429 }
    );
  }

  // `kind=document` opts in to PDF uploads (status-ticket evidence,
  // official-response receipts). The default flow stays image-only so
  // sesizari photo uploads can't accidentally accept arbitrary PDFs.
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") === "document" ? "document" : "image";
  const allowedTypes = kind === "document" ? ALLOWED_DOC_TYPES : ALLOWED_IMAGE_TYPES;

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "Niciun fișier selectat" }, { status: 400 });
    }
    if (files.length > 5) {
      return NextResponse.json({ error: "Maxim 5 fișiere pe upload" }, { status: 400 });
    }

    // Validate each file — MIME + size + magic number
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: `Tip invalid: ${file.type}` }, { status: 400 });
      }
      const sizeCap = file.type === "application/pdf" ? PDF_MAX_BYTES : MAX_FILE_SIZE;
      if (file.size > sizeCap) {
        return NextResponse.json({ error: `Fișier prea mare: ${file.name}` }, { status: 400 });
      }
      const validMagic =
        file.type === "application/pdf"
          ? await isValidPdf(file)
          : await isValidImage(file);
      if (!validMagic) {
        return NextResponse.json(
          {
            error:
              file.type === "application/pdf"
                ? `Fișier PDF corupt: ${file.name}`
                : `Fișier corupt sau nu e imagine reală: ${file.name}`,
          },
          { status: 400 }
        );
      }
    }

    // Use anon key client — storage policy `photos_upload_anyone` allows public uploads
    // to the sesizari-photos bucket. No need for service_role here.
    const supabase = await createSupabaseServer();
    const uploaded: string[] = [];

    // Map MIME type → safe extension (don't trust client filename)
    const extFromMime: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "application/pdf": "pdf",
    };

    for (const file of files) {
      const ext = extFromMime[file.type] ?? "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `public/${filename}`;

      const arrayBuffer = await file.arrayBuffer();
      const { error } = await supabase.storage
        .from("sesizari-photos")
        .upload(path, arrayBuffer, {
          contentType: file.type,
          cacheControl: "3600",
        });

      if (error) {
        return NextResponse.json({ error: `Eroare upload: ${error.message}` }, { status: 500 });
      }

      const { data } = supabase.storage.from("sesizari-photos").getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }

    return NextResponse.json({ data: { urls: uploaded } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Eroare upload";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
