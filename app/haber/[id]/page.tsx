import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { haberById, sonHaberler, istanbulFormat } from "../../../lib/queries";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Per-haber meta — spec §3.D */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const haber = await haberById(Number(id));
  if (!haber) return { title: "Haber Bulunamadı" };
  return {
    title: haber.baslik,
    description: haber.ozet ?? undefined,
    openGraph: {
      title: haber.baslik,
      description: haber.ozet ?? undefined,
      type: "article",
      publishedTime: haber.yayin_tarihi ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: haber.baslik,
      description: haber.ozet ?? undefined,
    },
  };
}

const KATEGORİ_AD: Record<string, string> = {
  ilkokul: "İlk Okul",
  ortaokul: "Orta Okul",
  lise: "Lise",
  avrupa: "Avrupa Eğitim Gündemi",
  dunya: "Dünyadan Haberler",
  genel: "Gündem",
};

export default async function HaberDetay({ params }: PageProps) {
  const { id } = await params;
  const haber = await haberById(Number(id));
  if (!haber) notFound();

  // İlgili haberler (aynı kategori, spec §3.D: gerçek veri)
  const tumHaberler = await sonHaberler(60);
  const ilgiliHaberler = tumHaberler
    .filter((h) => h.id !== haber.id && h.kategori === haber.kategori)
    .slice(0, 6);

  const kategoriAd = KATEGORİ_AD[haber.kategori] ?? haber.kategori;

  // Spec §2.5: Europe/Istanbul timezone
  const tarih = istanbulFormat(haber.yayin_tarihi ?? haber.eklenme_tarihi, {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  // Saat sadece yayin_tarihi varsa gösterilir (spec §2.5)
  const saatVar = !!haber.yayin_tarihi;

  return (
    <div className="wrap haber-detay-wrap">

      {/* ─── 2 sütun: makale + kenar çubuğu ─── */}
      <div className="haber-detay-grid">

        {/* Makale */}
        <article className="haber-makale">

          {/* Breadcrumb — spec §3.D: slug tutarlılığı */}
          <nav className="haber-breadcrumb" aria-label="Konum">
            <a href="/">Ana Sayfa</a>
            <span aria-hidden="true">›</span>
            <a href={`/kategori/${haber.kategori}`}>{kategoriAd}</a>
          </nav>

          {/* Kaynak + tarih */}
          <div className="haber-meta">
            {/* Spec §2.4: toLocaleUpperCase('tr-TR') */}
            <span className="haber-meta__kaynak">
              {haber.kaynak_adi.toLocaleUpperCase("tr-TR")}
            </span>
            {saatVar && (
              <span className="haber-meta__tarih">{tarih}</span>
            )}
          </div>

          {/* Başlık */}
          <h1 className="haber-baslik">{haber.baslik}</h1>

          {/* Ayırıcı çizgi */}
          <div className="haber-divider" />

          {/* Özet — spec §2.4: haberin tam özeti */}
          {haber.ozet && (
            <p className="haber-ozet">{haber.ozet}</p>
          )}

          {/* Görsel — yoksa hiçbir şey (spec §3.A: placeholder metin yok) */}
          {haber.resim_url && (
            <div className="haber-gorsel-wrap" style={{ margin: "24px 0" }}>
              <img
                src={haber.resim_url}
                alt={haber.baslik}
                style={{ width: "100%", height: "auto", display: "block", borderRadius: "4px" }}
              />
            </div>
          )}

          {/* Spec §2.4: Kaynak düz metin — hyperlink yok, dış çıkış yok */}
          <p className="haber-kaynak-metin">
            Kaynak: {haber.kaynak_adi}
          </p>

          {/* NOT: "Haberin tamamını X'te oku →" butonu KALDIRILDI (spec §1.4 & §4) */}

          {/* Küçük not */}
          <p className="haber-not">
            Bu haber <strong>{haber.kaynak_adi}</strong> tarafından yayımlanmıştır.
            Eğitimde Son Dakika, haberleri ajans beslemelerinden otomatik olarak derlemektedir.
          </p>

        </article>

        {/* Kenar çubuğu — İlgili haberler */}
        {ilgiliHaberler.length > 0 && (
          <aside className="haber-sidebar" aria-label="İlgili haberler">
            <div className="haber-sidebar__title">{kategoriAd} Haberleri</div>
            {ilgiliHaberler.map((h) => (
              <div key={h.id} className="haber-sidebar__item">
                <span className="haber-sidebar__kaynak">
                  {h.kaynak_adi.toLocaleUpperCase("tr-TR")}
                </span>
                <a href={`/haber/${h.id}`} className="haber-sidebar__link">
                  {h.baslik}
                </a>
              </div>
            ))}
          </aside>
        )}

      </div>
    </div>
  );
}
