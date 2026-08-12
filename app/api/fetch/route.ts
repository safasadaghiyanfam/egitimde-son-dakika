/**
 * app/api/fetch/route.ts
 * GET /api/fetch → Tüm RSS kaynaklarını çek ve DB'ye kaydet.
 *
 * Güvenlik: CRON_SECRET env değişkeniyle koruyabilirsiniz.
 * Örnek cron çağrısı (Vercel Cron veya harici):
 *   curl -H "Authorization: Bearer $CRON_SECRET" /api/fetch
 */

import { NextResponse } from "next/server";
import { tumKaynaklariCek } from "../../../jobs/fetch-news";

export const runtime = "nodejs";      // better-sqlite3 için zorunlu
export const dynamic = "force-dynamic";
export const maxDuration = 60;        // Vercel Pro'da 60s, Hobby'de 10s

export async function GET(request: Request) {
  // İsteğe bağlı: secret token ile koru
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
  }

  try {
    const sonuclar = await tumKaynaklariCek();
    const toplamEklenen = sonuclar.reduce((t, s) => t + s.eklenen, 0);
    const hatalar = sonuclar.filter((s) => s.hata).map((s) => ({ kaynak: s.kaynak, hata: s.hata }));

    return NextResponse.json({
      ok: true,
      tarih: new Date().toISOString(),
      toplamEklenen,
      sonuclar,
      hatalar,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, hata: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
