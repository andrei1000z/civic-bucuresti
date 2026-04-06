import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import { isValidImage } from "@/lib/sanitize";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`upload:${ip}`, { limit: 15, windowMs: 5 * 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Prea multe uploads. Așteaptă câteva minute." },
      { status: 429 }
    );
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }
    if (files.length > 5) {
      return NextResponse.json({ error: "Max 5 files" }, { status: 400 });
    }

    // Validate each file — MIME + size + magic number
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `Tip invalid: ${file.type}` }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `Fișier prea mare: ${file.name}` }, { status: 400 });
      }
      const validMagic = await isValidImage(file);
      if (!validMagic) {
        return NextResponse.json(
          { error: `Fișier corupt sau nu e imagine reală: ${file.name}` },
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
        return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
      }

      const { data } = supabase.storage.from("sesizari-photos").getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }

    return NextResponse.json({ data: { urls: uploaded } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
