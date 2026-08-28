import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { kategoriHaberleri, haberSayisi, istanbulFormat, saatString } from "../../../lib/queries";
import type { Haber } from "../../../lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const KATEGORİ_META: Record<string, { baslik: string; aciklama: string }> = {
  ilkokul:  { baslik: "İlk Okul",                  aciklama: "İlkokullar, 1-4. sınıf eğitimi ve okul öncesi haberleri." },
  ortaokul: { baslik: "Orta Okul",                 aciklama: "Ortaokul eğitimi, 5-8. sınıf ve LGS hazırlık süreçleri." },
  lise:     { baslik: "Lise",                      aciklama: "Lise eğitimi, YKS, LGS, ÖSYM sınav haberleri ve sonuçları." },
  avrupa:   { baslik: "Avrupa Eğitim Gündemi",     aciklama: "AB ülkelerinden ve Avrupa'dan eğitim politikası haberleri." },
  dunya:    { baslik: "Dünyadan Eğitim Haberleri", aciklama: "Dünyanın dört bir yanından eğitim sistemi ve politika haberleri." },
  genel:    { baslik: "Genel Eğitim",              aciklama: "Eğitim gündeminden tüm haberler." },
};

interface PageProps { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = KATEGORİ_META[slug];
  if (!meta) return {};
  return {
    title: meta.baslik,
    description: meta.aciklama,
    openGraph: { type: "website" },
  };
}

export default async function KategoriSayfasi({ params }: PageProps) {
  const { slug } = await params;
  const meta = KATEGORİ_META[slug];
  if (!meta) notFound();

  // Spec §3.B: kategori filtresi gerçekten slug'a göre filtreli
  // "genel" kategorisi tüm sayfalar için ek kaynak olarak dahil edilir
  const dogrudan = await kategoriHaberleri(slug, 60);
  const genelEk  = slug !== "genel" ? await kategoriHaberleri("genel", 40) : [];

  // Deduplicate (kaynak_url'ye göre)
  const urlSeti = new Set<string>();
  const haberler = [...dogrudan, ...genelEk].filter((h) => {
    if (urlSeti.has(h.kaynak_url)) return false;
    urlSeti.add(h.kaynak_url);
    return true;
  });

  const manshet   = haberler[0] ?? null;
  const kisaHaber = haberler.slice(1, 5);
  const akis      = haberler.slice(5, 45);

  return (
    <>
      {/* Kategori başlık şeridi */}
      <div className="kat-band">
        <div className="wrap kat-band__inner">
          <span className="kat-band__label">{meta.baslik}</span>
          <span className="kat-band__desc">{meta.aciklama}</span>
        </div>
      </div>

      {haberler.length === 0 ? (
        <div className="wrap" style={{ padding: "48px 0" }}>
          <p style={{ fontFamily: "var(--font-ui)", color: "var(--muted)" }}>
            Bu kategoride henüz haber bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="three-col-grid">

          {/* SOL — Öne Çıkanlar */}
          <aside aria-label="Öne çıkan haberler">
            <div className="kisa-kisa__title">Öne Çıkanlar</div>
            {kisaHaber.map((h) => (
              <div key={h.id} className="kisa-item">
                <div className="kisa-item__cat">
                  {h.kaynak_adi.toLocaleUpperCase("tr-TR")}
                </div>
                <a
                  href={`/haber/${h.id}`}
                  className="kisa-item__title"
                  style={{
                    display: "block",
                    fontFamily: "'Libre Caslon Display', Georgia, serif",
                    fontSize: "17px",
                    lineHeight: "1.25",
                    fontWeight: 400,
                    marginBottom: "6px",
                  }}
                >
                  {h.baslik}
                </a>
                {h.ozet && <p className="kisa-item__desc">{h.ozet}</p>}
              </div>
            ))}
          </aside>

          {/* ORTA — Manşet */}
          {manshet ? (
            <article aria-label="Öne çıkan haber">
              <div className="manshet__overline">
                {meta.baslik} · {manshet.kaynak_adi.toLocaleUpperCase("tr-TR")}
              </div>
              <a href={`/haber/${manshet.id}`} style={{ display: "block" }}>
                <h1 className="manshet__title">{manshet.baslik}</h1>
              </a>
              {manshet.ozet && <p className="manshet__lead">{manshet.ozet}</p>}

              {/* Görsel — yoksa placeholder metin yok (spec §3.A) */}
              {manshet.resim_url && (
                <div className="manshet__img-wrap">
                  <img
                    src={manshet.resim_url}
                    alt={manshet.baslik}
                    className="manshet__img"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>
              )}

              <p className="manshet__caption">
                {/* Spec §2.4 + §3.C: Türkçe uppercase */}
                KAYNAK: {manshet.kaynak_adi.toLocaleUpperCase("tr-TR")} ·{" "}
                {istanbulFormat(manshet.yayin_tarihi ?? manshet.eklenme_tarihi, {
                  day: "2-digit", month: "long", year: "numeric",
                })}
              </p>
            </article>
          ) : (
            <div />
          )}

          {/* SAĞ — Haber akışı */}
          <aside aria-label="Haber akışı">
            <div className="son-dakika__header">
              <span className="son-dakika__badge">Son Haberler</span>
              <span className="son-dakika__count">{haberler.length} haber</span>
            </div>
            {akis.map((h) => {
              const saat = saatString(h);
              return (
                <div key={h.id} className="sd-item">
                  {/* Saat sadece yayin_tarihi varsa (spec §2.5) */}
                  {saat && (
                    <span className="sd-item__time">{saat}</span>
                  )}
                  <a href={`/haber/${h.id}`} className="sd-item__title">
                    {h.baslik}
                  </a>
                </div>
              );
            })}
          </aside>

        </div>
      )}
    </>
  );
}
