/**
 * jobs/fetch-news.ts
 * Tüm RSS kaynaklarını sırayla çeker ve DB'ye kaydeder.
 * İki şekilde çalışır:
 *   1. Next.js Route Handler (API) → GET /api/fetch → elle veya cron ile tetikle
 *   2. Doğrudan node ile: npx ts-node jobs/fetch-news.ts
 */

import KAYNAKLAR from "../data/kaynaklar";
import { rssKaydetKaynak, KaydetSonucu } from "../lib/rss";

export async function tumKaynaklariCek(): Promise<KaydetSonucu[]> {
  console.log(`[fetch-news] ${new Date().toISOString()} — Başlıyor (${KAYNAKLAR.length} kaynak)`);

  const sonuclar: KaydetSonucu[] = [];

  // Paralel değil sıralı — sunucu kaynaklarını zorlamadan
  for (const kaynak of KAYNAKLAR) {
    const s = await rssKaydetKaynak(kaynak);
    sonuclar.push(s);

    if (s.hata) {
      console.warn(`  [HATA] ${s.kaynak}: ${s.hata}`);
    } else {
      console.log(`  [OK]   ${s.kaynak}: ${s.eklenen} yeni / ${s.toplam} toplam`);
    }
  }

  const toplamEklenen = sonuclar.reduce((t, s) => t + s.eklenen, 0);
  console.log(`[fetch-news] Tamamlandı — ${toplamEklenen} yeni haber eklendi`);

  return sonuclar;
}

// Doğrudan node ile çalıştırılırsa
if (require.main === module) {
  tumKaynaklariCek().catch(console.error);
}
