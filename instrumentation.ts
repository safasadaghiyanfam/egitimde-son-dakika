/**
 * instrumentation.ts
 * Next.js sunucu başlangıç kancası.
 * Vercel'de node-cron çalışmaz — bunun yerine vercel.json'da cron tanımlanır.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== "edge") {
    const { setupDb } = await import("./lib/db");

    // DB tablosunu oluştur (yoksa)
    await setupDb().catch((e) => console.error("[db] Tablo kurulumu hatası:", e));
    console.log("[db] Veritabanı hazır.");

    // Yerel geliştirmede node-cron ile otomatik çekme (Vercel'de devre dışı)
    if (!process.env.VERCEL) {
      const { default: cron } = await import("node-cron");
      const { tumKaynaklariCek } = await import("./jobs/fetch-news");

      console.log("[cron] Yerel sunucu — ilk RSS çekimi yapılıyor...");
      tumKaynaklariCek().catch((e) => console.error("[cron] İlk çekim hatası:", e));

      cron.schedule("*/10 * * * *", () => {
        tumKaynaklariCek().catch((e) => console.error("[cron] Güncelleme hatası:", e));
      });

      console.log("[cron] Zamanlanmış görev aktif — her 10 dakikada bir güncellenir.");
    }
  }
}
