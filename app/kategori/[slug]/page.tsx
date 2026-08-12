import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { kategoriHaberleri } from "../../../lib/queries";

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
  return { title: meta.baslik, description: meta.aciklama };
}

export default async function KategoriSayfasi({ params }: PageProps) {
  const { slug } = await params;
  const meta = KATEGORİ_META[slug];
  if (!meta) notFound();

  // Doğrudan kategoriye ait + genel haberler
  const dogrudan = await kategoriHaberleri(slug, 60);
  const genelEk  = slug !== "genel" ? await kategoriHaberleri("genel", 40) : [];

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
      {/* ── Kategori başlık şeridi ── */}
      <div className="kat-band">
        <div className="wrap kat-band__inner">
          <span className="kat-band__label">{meta.baslik}</span>
          <span className="kat-band__desc">{meta.aciklama}</span>
        </div>
      </div>

      {haberler.length === 0 ? (
        <div className="wrap" style={{ padding: "48px 0" }}>
          <p style={{ fontFamily: "var(--font-ui)", color: "var(--muted)" }}>
            Bu kategoride henüz haber bulunmuyor.{" "}
            <a href="/api/fetch" className="link-red">RSS'i şimdi güncelle →</a>
          </p>
        </div>
      ) : (
        <div className="three-col-grid">

          {/* SOL — Kısa haberler */}
          <aside aria-label="Kısa haberler">
            <div className="kisa-kisa__title">Öne Çıkanlar</div>
            {kisaHaber.map((h) => (
              <div key={h.id} className="kisa-item">
                <div className="kisa-item__cat">{h.kaynak_adi}</div>
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
              <div className="manshet__overline">{meta.baslik} · {manshet.kaynak_adi}</div>
              <a
                href={`/haber/${manshet.id}`}
                style={{ display: "block" }}
              >
                <h1 className="manshet__title">{manshet.baslik}</h1>
              </a>
              {manshet.ozet && <p className="manshet__lead">{manshet.ozet}</p>}
              <div className="manshet__img-wrap">
                {manshet.resim_url ? (
                  <img
                    src={manshet.resim_url}
                    alt={manshet.baslik}
                    className="manshet__img"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                ) : (
                  <div className="img-placeholder">Manşet görseli — 16:9</div>
                )}
              </div>
              <p className="manshet__caption">
                KAYNAK: {manshet.kaynak_adi.toUpperCase()} ·{" "}
                {new Date(manshet.yayin_tarihi ?? manshet.eklenme_tarihi).toLocaleString("tr-TR")}
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
            {akis.map((h) => (
              <div key={h.id} className="sd-item">
                <span className="sd-item__time">
                  {new Date(h.yayin_tarihi ?? h.eklenme_tarihi).toLocaleTimeString("tr-TR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <a
                  href={`/haber/${h.id}`}
                  className="sd-item__title"
                >
                  {h.baslik}
                </a>
              </div>
            ))}
          </aside>

        </div>
      )}
    </>
  );
}
