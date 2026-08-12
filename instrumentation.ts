/**
 * instrumentation.ts
 * Next.js'in sunucu başlangıç kancası.
 * Sunucu ayağa kalktığında bir kez çalışır ve cron görevini başlatır.
 *
 * Belge: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Yalnızca sunucu tarafında çalıştır (Edge runtime'ı atla)
  if (process.env.NEXT_RUNTIME !== "edge") {
    const { setupDb } = await import("./lib/db");
    const { default: cron } = await import("node-cron");
    const { tumKaynaklariCek } = await import("./jobs/fetch-news");

    // DB tablosunu oluştur (yoksa)
    await setupDb().catch((e) => console.error("[db] Tablo kurulumu hatası:", e));

    // İlk çalıştırmada hemen bir kez çek
    console.log("[cron] Sunucu başladı — ilk RSS çekimi yapılıyor...");
    tumKaynaklariCek().catch((e) =>
      console.error("[cron] İlk çekim hatası:", e)
    );

    // Her 10 dakikada bir otomatik çek
    cron.schedule("*/10 * * * *", () => {
      console.log("[cron] RSS güncelleniyor...");
      tumKaynaklariCek().catch((e) =>
        console.error("[cron] Güncelleme hatası:", e)
      );
    });

    console.log("[cron] Zamanlanmış görev aktif — her 10 dakikada bir güncellenir.");
  }
}
