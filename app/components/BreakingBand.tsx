/**
 * app/components/BreakingBand.tsx
 * Kırmızı son dakika şeridi — DB'den gerçek en yeni haberler
 * Spec §3.A: Uydurma başlık yok; her öğe /haber/{id} site-içi link
 */
import { sonDakikaSerit } from "../../lib/queries";

export default async function BreakingBand() {
  let haberler: Awaited<ReturnType<typeof sonDakikaSerit>> = [];
  try {
    haberler = await sonDakikaSerit(8);
  } catch {
    // DB bağlantı hatası — şeridi gizle (boş liste)
  }

  if (haberler.length === 0) return null; // Haber yoksa şeridi render etme

  // SEO / erişilebilirlik: kopyayı aria-hidden ile işaretle
  const doubled = [...haberler, ...haberler];

  return (
    <div className="breaking-band" role="marquee" aria-label="Son dakika haberleri">
      <div className="breaking-band__label" aria-hidden="true">
        <span>◆</span> Son Dakika
      </div>
      {/* Görünür (erişilebilir) kopya */}
      <ul className="breaking-band__track sr-only" aria-label="Son dakika haber listesi">
        {haberler.map((h) => (
          <li key={h.id}>
            <a href={`/haber/${h.id}`}>{h.baslik}</a>
          </li>
        ))}
      </ul>
      {/* Animasyonlu görsel kopya — aria-hidden */}
      <div className="breaking-band__track" aria-hidden="true">
        <div className="breaking-band__inner">
          {doubled.map((h, i) => (
            <a
              key={`${h.id}-${i}`}
              href={`/haber/${h.id}`}
              className="breaking-item"
            >
              {/* Spec §2.4: toLocaleUpperCase('tr-TR') — İ/I hatası yok */}
              {h.baslik.toLocaleUpperCase("tr-TR")}
              <span className="breaking-sep">◆</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
