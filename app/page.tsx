import type { Metadata } from "next";
import { sonHaberler, haberSayisi, gunVeSaatGruplari, saatString, istanbulFormat, type GunGrubu } from "../lib/queries";
import type { Haber } from "../lib/db";
import NewsSlider, { type SlideHaber } from "./components/NewsSlider";

export const metadata: Metadata = {
  title: "Eğitimde Son Dakika | MEB, ÖSYM, YÖK, Sınav Haberleri",
  description: "Türkiye eğitim gündeminden son dakika haberleri: MEB, ÖSYM, YÖK, YKS, LGS, KPSS.",
};

// Her istekte taze veri
export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ─────────────────────────────────────────────
   ALT BİLEŞENLER
   ───────────────────────────────────────────── */

/** Son Dakika Akışı — Gün + Saat gruplu */
function SonDakikaAkisi({ gunGruplari }: { gunGruplari: GunGrubu[] }) {
  if (gunGruplari.length === 0) {
    return (
      <div className="son-dakika__bos">
        <p>Haber yükleniyor, lütfen bekleyin.</p>
      </div>
    );
  }

  return (
    <>
      {gunGruplari.map((gun) => (
        <div key={gun.gunEtiketi}>
          {/* Gün ayıracı */}
          <div className="sd-item sd-item--day-separator">
            <span className="sd-item__day">{gun.gunEtiketi}</span>
          </div>
          {gun.saatGruplari.map((grup) => (
            <div key={grup.saat}>
              {/* Saat ayıracı */}
              <div className="sd-item sd-item--separator">
                <span className="sd-item__time sd-item__time--separator">{grup.saat}</span>
              </div>
              {grup.haberler.map((h) => {
                const saat = saatString(h);
                return (
                  <div key={h.id} className="sd-item">
                    {saat && (
                      <span className="sd-item__time">{saat}</span>
                    )}
                    <a href={`/haber/${h.id}`} className="sd-item__title">
                      {h.baslik}
                    </a>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

/** Orta Sütun: Ana Manşet + Kesintisiz Son Dakika Haber Akışı */
function OrtaManshetBolumu({ haberler }: { haberler: Haber[] }) {
  if (!haberler || haberler.length === 0) {
    return (
      <article aria-label="Manşet haber">
        <div className="manshet__bos">
          <p>Manşet haber bekleniyor…</p>
        </div>
      </article>
    );
  }

  const anaManshet = haberler[0];
  const devamHaberleri = haberler.slice(1); // Manşetin altına kesintisiz devam eden tüm haberler

  const tarihStr = istanbulFormat(anaManshet.yayin_tarihi ?? anaManshet.eklenme_tarihi, {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* 1. ANA MANŞET KARTI */}
      <article aria-label="Ana manşet haber">
        <div className="manshet__overline">
          Manşet · {anaManshet.kaynak_adi.toLocaleUpperCase("tr-TR")}
        </div>
        <a href={`/haber/${anaManshet.id}`} style={{ display: "block" }}>
          <h1 className="manshet__title">{anaManshet.baslik}</h1>
        </a>
        {anaManshet.ozet && <p className="manshet__lead">{anaManshet.ozet}</p>}

        {anaManshet.resim_url && (
          <div className="manshet__img-wrap">
            <img
              src={anaManshet.resim_url}
              alt={anaManshet.baslik}
              className="manshet__img"
              style={{ width: "100%", height: "auto", display: "block", borderRadius: "4px" }}
            />
          </div>
        )}

        <p className="manshet__caption">
          KAYNAK: {anaManshet.kaynak_adi.toLocaleUpperCase("tr-TR")} · {tarihStr}
        </p>
      </article>

      {/* 2. KESİNTİSİZ DEVAM EDEN HABER AKIŞI */}
      {devamHaberleri.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            borderTop: "2px solid var(--red, #c00)",
            paddingTop: "24px",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--red, #c00)" }}>
            Gündemdeki Diğer Haberler
          </div>

          {devamHaberleri.map((h) => {
            const hTarih = istanbulFormat(h.yayin_tarihi ?? h.eklenme_tarihi, {
              day: "2-digit", month: "long", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            });

            return (
              <article
                key={h.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  borderBottom: "1px solid var(--border, #eee)",
                  paddingBottom: "20px",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--red, #c00)", textTransform: "uppercase" }}>
                  {h.kaynak_adi.toLocaleUpperCase("tr-TR")}
                </div>
                <a
                  href={`/haber/${h.id}`}
                  style={{
                    fontFamily: "'Libre Caslon Display', Georgia, serif",
                    fontSize: "20px",
                    lineHeight: "1.25",
                    fontWeight: 600,
                    color: "#111",
                    textDecoration: "none",
                  }}
                >
                  {h.baslik}
                </a>
                {h.ozet && (
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: "14px", lineHeight: "1.5", color: "#555", margin: 0 }}>
                    {h.ozet}
                  </p>
                )}
                {h.resim_url && (
                  <a href={`/haber/${h.id}`} style={{ display: "block", overflow: "hidden", borderRadius: "4px", marginTop: "6px" }}>
                    <img
                      src={h.resim_url}
                      alt={h.baslik}
                      style={{ width: "100%", maxHeight: "280px", objectFit: "cover", display: "block" }}
                    />
                  </a>
                )}
                <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                  KAYNAK: {h.kaynak_adi.toLocaleUpperCase("tr-TR")} · {hTarih}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ANA SAYFA
   ───────────────────────────────────────────── */
export default async function AnaSayfa() {
  let haberler: Haber[] = [];
  let toplamSayi = 0;
  try {
    haberler = await sonHaberler(80);
    toplamSayi = await haberSayisi();
  } catch (e) {
    console.error("[page] DB hatası:", e);
  }

  // Slider için görseli olan gerçek DB haberlerini dönüştür (En son 10 haber — kendi sitemizdeki haber detayına linkler)
  const sliderHaberleri: SlideHaber[] = haberler
    .filter((h) => h.resim_url && h.resim_url.startsWith("http"))
    .slice(0, 10)
    .map((h) => ({
      id: h.id,
      baslik: h.baslik,
      gorselUrl: h.resim_url!,
      saat: saatString(h) || "15:00",
      link: `/haber/${h.id}`,
    }));

  const gunGruplari = gunVeSaatGruplari(haberler.slice(0, 40));

  // Düzenleme:
  // - Sol sütun: 10 adet Kısa Kısa haber
  // - Orta sütun: Ana Manşet + altında kesintisiz 20 haber akışı (hiç boşluk kalmaz)
  // - Öne Çıkanlar: 12 kartlık zengin haber ızgarası
  const kisaHaberler = haberler.slice(1, 11);
  const ortaHaberler = haberler.slice(0, 20); // Orta sütunu tam dolduran 20 haberlik kesintisiz akış
  const oneCikanlar = haberler.slice(20, 32); // 12 kartlık öne çıkanlar gridi
  const dahaFazlaHaberler = haberler.slice(32);

  return (
    <>
      {/* ══════════════════════════════════════
          MANŞET SLIDER (CAROUSEL) BİLEŞENİ
          ══════════════════════════════════════ */}
      <div className="wrap" style={{ marginBottom: "28px" }}>
        <NewsSlider
          haberler={sliderHaberleri.length > 0 ? sliderHaberleri : undefined}
          autoPlayInterval={5000}
        />
      </div>

      {/* ══════════════════════════════════════
          3 SÜTUN ANA BÖLÜM
          ══════════════════════════════════════ */}
      <div className="three-col-grid">

        {/* ── SOL: KISA KISA ── */}
        <aside aria-label="Kısa haberler">
          <div className="kisa-kisa__title">Kısa Kısa</div>
          {kisaHaberler.length === 0 ? (
            <p style={{ padding: "12px", color: "#666", fontSize: "14px" }}>
              Haberler yükleniyor…
            </p>
          ) : (
            kisaHaberler.map((h) => (
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
                    lineHeight: "1.22",
                    fontWeight: 400,
                    marginBottom: "6px",
                    textWrap: "pretty",
                  }}
                >
                  {h.baslik}
                </a>
                {h.ozet && <p className="kisa-item__desc">{h.ozet}</p>}
              </div>
            ))
          )}
        </aside>

        {/* ── ORTA: KESİNTİSİZ MANŞET VE HABER AKIŞI ── */}
        <OrtaManshetBolumu haberler={ortaHaberler} />

        {/* ── SAĞ: SON DAKİKA AKIŞI ── */}
        <aside aria-label="Son dakika akışı">
          <div className="son-dakika__header">
            <span className="son-dakika__badge">Son Dakika Akışı</span>
            <span className="son-dakika__count">{toplamSayi} haber</span>
          </div>
          <SonDakikaAkisi gunGruplari={gunGruplari} />
        </aside>

      </div>

      {/* ══════════════════════════════════════
          ÖNE ÇIKANLAR — 12 Kartlık Zengin Grid
          ══════════════════════════════════════ */}
      {oneCikanlar.length > 0 && (
        <section className="one-cikanlar" aria-label="Öne çıkan haberler">
          <div className="one-cikanlar__header">Öne Çıkan Eğitim Haberleri</div>
          <div className="one-cikanlar__grid">
            {oneCikanlar.map((h) => (
              <div key={h.id} className="one-card">
                {h.resim_url && (
                  <div className="one-card__img">
                    <img
                      src={h.resim_url}
                      alt={h.baslik}
                      style={{ width: "100%", height: "auto", display: "block" }}
                    />
                  </div>
                )}
                <div className="one-card__cat">
                  {h.kaynak_adi.toLocaleUpperCase("tr-TR")}
                </div>
                <a
                  href={`/haber/${h.id}`}
                  className="one-card__title"
                  style={{
                    display: "block",
                    fontFamily: "'Libre Caslon Display', Georgia, serif",
                    fontSize: "19px",
                    lineHeight: "1.22",
                    fontWeight: 400,
                    marginBottom: "6px",
                    textWrap: "pretty",
                  }}
                >
                  {h.baslik}
                </a>
                {h.ozet && <p className="one-card__desc">{h.ozet}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          DAHA FAZLA HABER
          ══════════════════════════════════════ */}
      {dahaFazlaHaberler.length > 0 && (
        <section className="daha-fazla" aria-label="Daha fazla haber">
          <div className="wrap">
            <div className="daha-fazla__header">Tüm Haberler</div>
            <div className="daha-fazla__liste">
              {dahaFazlaHaberler.map((h) => {
                const saat = saatString(h);
                return (
                  <a key={h.id} href={`/haber/${h.id}`} className="daha-fazla__item">
                    <span className="daha-fazla__kaynak">
                      {h.kaynak_adi.toLocaleUpperCase("tr-TR")}
                    </span>
                    <span className="daha-fazla__baslik">{h.baslik}</span>
                    {saat && (
                      <span className="daha-fazla__saat">{saat}</span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
